import router from '@adonisjs/core/services/router'
const StudentsController = () => import('#controllers/students_controller')
const TeachersController = () => import('#controllers/teachers_controller')
const RoomsController = () => import('#controllers/rooms_controller')

router.group(() => {
  router.post('/students', [StudentsController, 'store'])
  router.get('/students/:id', [StudentsController, 'show'])
  router.put('/students/:id', [StudentsController, 'update'])
  router.delete('/students/:id', [StudentsController, 'destroy'])
  router.get('/students/:id/rooms', [StudentsController, 'getRooms'])

  router.post('/teachers', [TeachersController, 'store'])
  router.get('/teachers/:id', [TeachersController, 'show'])
  router.put('/teachers/:id', [TeachersController, 'update'])
  router.delete('/teachers/:id', [TeachersController, 'destroy'])

  router.post('/teachers/:teacherId/rooms', [RoomsController, 'store'])
  router.get('/rooms/:id', [RoomsController, 'show'])
  router.put('/rooms/:id', [RoomsController, 'update'])
  router.delete('/rooms/:id', [RoomsController, 'destroy'])
  router.post('/rooms/:roomId/allocate/:studentId', [RoomsController, 'allocateStudent'])
  router.delete('/rooms/:roomId/deallocate/:studentId', [RoomsController, 'deallocateStudent'])
  router.get('/rooms/:id/students', [RoomsController, 'getStudents'])
}).prefix('/api')