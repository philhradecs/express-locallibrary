const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Book = require('../models/book');
const Genre = require('../models/genre');

// Display list of all Genre.
exports.genre_list = (req, res, next) => {
	Genre.find()
		.sort([['name', 'ascending']])
		.exec((err, list_authors) => {
			if (err) {
				next(err);
			}
			res.render('genre_list', {
				title: 'Genre List',
				genre_list: list_authors,
			});
		});
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
	async.parallel(
		{
			genre(callback) {
				Genre.findById(req.params.id).exec(callback);
			},

			genre_books(callback) {
				Book.find({ genre: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				next(err);
			}
			if (results.genre == null) {
				const error = new Error('Genre not found');
				error.status = 404;
				next(error);
			}
			res.render('genre_detail', {
				title: 'Genre Detail',
				genre: results.genre,
				genre_books: results.genre_books,
			});
		}
	);
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
	res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
	body('name', 'Genre name required')
		.isLength({ min: 1 })
		.trim(),
	sanitizeBody('name')
		.trim()
		.escape(),
	(req, res, next) => {
		const errors = validationResult(req);
		const genre = new Genre({ name: req.body.name });

		if (!errors.isEmpty()) {
			res.render('genre_form', {
				title: 'Create Genre',
				genre,
				errors: errors.array(),
			});
			return;
		}
		Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
			if (err) {
				next(err);
			}
			if (found_genre) {
				res.redirect(found_genre.url);
			} else {
				genre.save(error => {
					if (error) {
						next(error);
					}
					res.redirect(genre.url);
				});
			}
		});
	},
];

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res) => {
	res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res) => {
	res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res) => {
	res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = (req, res) => {
	res.send('NOT IMPLEMENTED: Genre update POST');
};
