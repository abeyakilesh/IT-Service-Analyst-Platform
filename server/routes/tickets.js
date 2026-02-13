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

router.get('/', getTickets);
router.post('/', validate(createTicketValidator), createTicket);

router.get('/:id', getTicket);
router.put('/:id', validate(updateTicketValidator), updateTicket);
router.delete('/:id', authorize('admin'), deleteTicket);

module.exports = router;
