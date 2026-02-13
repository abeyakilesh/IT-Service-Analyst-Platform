const router = require('express').Router();
const {
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
} = require('../controllers/ticketController');
const { createTicketValidator, updateTicketValidator } = require('../validators/ticket');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All ticket routes require auth

router
    .route('/')
    .get(getTickets)
    .post(createTicketValidator, validate, createTicket);

router
    .route('/:id')
    .get(getTicket)
    .put(updateTicketValidator, validate, updateTicket)
    .delete(authorize('admin'), deleteTicket);

module.exports = router;
