const router = require('express').Router();
const {
    getOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
} = require('../controllers/organizationController');
const { createOrganizationValidator } = require('../validators/organization');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

// Public — anyone can list orgs (needed for registration dropdown)
router.get('/', getOrganizations);

// Protected — admin only for mutations
router.use(protect);
router.use(authorize('admin'));

router.post('/', createOrganizationValidator, validate, createOrganization);

router
    .route('/:id')
    .get(getOrganization)
    .put(createOrganizationValidator, validate, updateOrganization)
    .delete(deleteOrganization);

module.exports = router;

