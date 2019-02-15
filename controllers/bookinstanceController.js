const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

// Display list of all BookInstances.
exports.bookinstance_list = (req, res, next) => {
	BookInstance.find()
		.populate('book')
		.exec((err, list_bookinstances) => {
			if (err) {
				return next(err);
			}
			res.render('bookinstance_list', {
				title: 'Book Instance List',
				bookinstance_list: list_bookinstances,
			});
		});
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
	BookInstance.findById(req.params.id)
		.populate('book')
		.exec((err, bookinstance) => {
			if (err) {
				return next(err);
			}
			if (bookinstance == null) {
				const error = new Error('Book copy not found');
				error.status = 404;
				return next(error);
			}
			res.render('bookinstance_detail', { title: 'Book', bookinstance });
		});
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {
	Book.find({}, 'title').exec((err, books) => {
		if (err) {
			return next(err);
		}
		res.render('bookinstance_form', {
			title: 'Create BookInstance',
			book_list: books,
		});
	});
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
	// Validate fields.
	body('book', 'Book must be specified')
		.isLength({ min: 1 })
		.trim(),
	body('imprint', 'Imprint must be specified')
		.isLength({ min: 1 })
		.trim(),
	body('due_back', 'Invalid date')
		.optional({ checkFalsy: true })
		.isISO8601(),

	// Sanitize fields.
	sanitizeBody('book')
		.trim()
		.escape(),
	sanitizeBody('imprint')
		.trim()
		.escape(),
	sanitizeBody('status')
		.trim()
		.escape(),
	sanitizeBody('due_back').toDate(),

	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a BookInstance object with escaped and trimmed data.
		const bookinstance = new BookInstance({
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			// express-validator's toDate method passes on null values
			// null values keep mongoose schema defaults grom kicking in
			// therefore converting `null` to `undefined`
			due_back:
				req.body.due_back === null ? undefined : req.body.due_back,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values and error messages.
			Book.find({}, 'title').exec((err, books) => {
				if (err) {
					return next(err);
				}
				// Successful, so render.
				res.render('bookinstance_form', {
					title: 'Create BookInstance',
					book_list: books,
					selected_book: bookinstance.book._id,
					errors: errors.array(),
					bookinstance,
					selected_status: bookinstance.status,
				});
			});
		} else {
			// Data from form is valid.
			bookinstance.save(err => {
				if (err) {
					return next(err);
				}
				// Successful - redirect to new record.
				res.redirect(bookinstance.url);
			});
		}
	},
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next) => {
	BookInstance.findById(req.params.id)
		.populate('book')
		.exec((err, bookinstance) => {
			if (err) {
				return next();
			}
			if (bookinstance == null) {
				res.redirect('/catalog/bookinstances');
			}
			res.render('bookinstance_delete', {
				title: 'Delete Book Instance',
				bookinstance,
			});
		});
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
	BookInstance.findById(req.params.id, (err, bookinstance) => {
		if (err) {
			return next();
		}
		if (bookinstance == null) {
			res.redirect('/catalog/bookinstances');
		} else {
			BookInstance.findByIdAndRemove(req.body.bookinstanceid, error => {
				if (error) {
					return next(error);
				}
				res.redirect('/catalog/bookinstances');
			});
		}
	});
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res, next) => {
	BookInstance.findById(req.params.id)
		.populate('book')
		.exec((err, bookinstance) => {
			if (err) {
				return next();
			}
			if (bookinstance == null) {
				const error = new Error('Copy not found');
				error.status = 404;
				return next(error);
			}

			res.render('bookinstance_form', {
				title: 'Update Copy',
				bookinstance,
				selected_status: bookinstance.status,
			});
		});
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
	// Validate fields.
	body('imprint', 'Imprint must be specified.')
		.isLength({ min: 1 })
		.trim(),
	body('status', 'Status must be specified.')
		.isLength({ min: 1 })
		.trim(),
	body('due_back', 'Invalid date')
		.optional({ checkFalsy: true })
		.isISO8601(),

	// Sanitize fields.
	sanitizeBody('book')
		.trim()
		.escape(),
	sanitizeBody('imprint')
		.trim()
		.escape(),
	sanitizeBody('status')
		.trim()
		.escape(),
	sanitizeBody('due_back').toDate(),

	(req, res, next) => {
		const errors = validationResult(req);

		const bookinstance = new BookInstance({
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			// express-validator's toDate method passes on null values
			// null values keep mongoose schema defaults grom kicking in
			// therefore converting `null` to `undefined`
			due_back:
				req.body.due_back === null ? undefined : req.body.due_back,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			res.render('bookinstance_form', {
				title: 'Update Copy',
				bookinstance,
				selected_status: bookinstance.status,
				errors: errors.array(),
			});
		} else {
			BookInstance.findByIdAndUpdate(
				req.params.id,
				bookinstance,
				{},
				(err, instance) => {
					if (err) {
						return next(err);
					}
					res.redirect(instance.url);
				}
			);
		}
	},
];
