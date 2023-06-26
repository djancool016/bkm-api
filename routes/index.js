const router = require('express').Router()

router.use('/lkm', require('./lkm-routes'))
router.use('/ksm', require('./ksm-routes'))

module.exports = router