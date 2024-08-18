const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Note = require('../models/Note');
const sanitizeHtml = require('sanitize-html');

// Add Note Page
router.get('/add', ensureAuthenticated, (req, res) => res.render('add_note'));

// Add Note
router.post('/add', ensureAuthenticated, (req, res) => {
  const { title, body } = req.body;
  const sanitizedBody = sanitizeHtml(body, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
  });
  const newNote = new Note({
    title,
    body: sanitizedBody,
    user: req.user.id
  });
  newNote.save()
    .then(note => {
      req.flash('success_msg', 'Note added successfully');
      res.redirect('/notes');
    })
    .catch(err => console.log(err));
});

// Edit Note Page
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Note.findById(req.params.id).then(note => {
    if (note.user != req.user.id) {
      req.flash('error_msg', 'Not Authorized');
      return res.redirect('/notes');
    }
    res.render('edit_note', {
      note: note
    });
  });
});

// Edit Note
router.put('/edit/:id', ensureAuthenticated, (req, res) => {
  const { title, body } = req.body;
  const sanitizedBody = sanitizeHtml(body, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
  });
  Note.findById(req.params.id).then(note => {
    note.title = title;
    note.body = sanitizedBody;
    note.save()
      .then(() => {
        req.flash('success_msg', 'Note updated successfully');
        res.redirect('/notes');
      });
  });
});

// Notes and search bar
router.get('/', ensureAuthenticated, (req, res) => {
  const search = req.query.search || '';
  const query = {
    user: req.user.id,
    archived: false, 
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { body: { $regex: search, $options: 'i' } }
    ]
  };
  Note.find(query).sort({ date: 'desc' }).then(notes => {
    res.render('notes', {
      notes: notes,
      search: search
    });
  });
});

// Deleting
router.delete('/delete/:id', ensureAuthenticated, (req, res) => {
  Note.findById(req.params.id)
    .then(note => {
      if (note.user != req.user.id) {
        req.flash('error_msg', 'Not Authorized');
        return res.redirect('/notes');
      }
      Note.findByIdAndDelete(req.params.id).then(() => {
        req.flash('success_msg', 'Note removed');
        res.redirect('/notes');
      });
    })
    .catch(err => {
      console.log(err);
      req.flash('error_msg', 'Error occurred while deleting the note');
      res.redirect('/notes');
    });
});

// Archiving
router.post('/archive/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    note.archived = true;
    await note.save();
    res.redirect('/notes');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Unarchiving
router.post('/unarchive/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    note.archived = false;
    await note.save();
    res.redirect('/notes/archive');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Archived notes page
router.get('/archive', ensureAuthenticated, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id, archived: true });
    res.render('archive_notes', { notes });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
