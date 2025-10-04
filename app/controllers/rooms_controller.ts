import type { HttpContext } from '@adonisjs/core/http'
import Room from '#models/room'
import Student from '#models/student'
import Teacher from '#models/teacher'

export default class RoomsController {
  async store({ params, request, response }: HttpContext) {
    try {
      const teacherId = params.teacherId
      const data = request.only(['roomNumber', 'capacity', 'available'])

      if (!data.roomNumber || !data.capacity || data.available === undefined) {
        return response.badRequest({
          error: 'Todos os campos são obrigatórios: roomNumber, capacity, available'
        })
      }

      const teacher = await Teacher.find(teacherId)
      if (!teacher) {
        return response.notFound({ error: 'Professor não encontrado' })
      }

      const existingRoom = await Room.query()
        .where('room_number', data.roomNumber)
        .where('teacher_id', teacherId)
        .first()

      if (existingRoom) {
        return response.conflict({ 
          error: 'Já existe uma sala com este número para este professor' 
        })
      }

      const room = await Room.create({
        ...data,
        teacherId: teacherId
      })

      return response.created({
        message: 'Sala cadastrada com sucesso',
        data: room
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao cadastrar sala',
        details: error.message
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const room = await Room.query()
        .where('id', params.id)
        .preload('teacher')
        .first()

      if (!room) {
        return response.notFound({ error: 'Sala não encontrada' })
      }

      return response.ok({ data: room })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao consultar sala',
        details: error.message
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const room = await Room.find(params.id)

      if (!room) {
        return response.notFound({ error: 'Sala não encontrada' })
      }

      const data = request.only(['roomNumber', 'capacity', 'available'])

      if (data.roomNumber && data.roomNumber !== room.roomNumber) {
        const existingRoom = await Room.query()
          .where('room_number', data.roomNumber)
          .where('teacher_id', room.teacherId)
          .whereNot('id', room.id)
          .first()

        if (existingRoom) {
          return response.conflict({ 
            error: 'Já existe uma sala com este número para este professor' 
          })
        }
      }

      room.merge(data)
      await room.save()

      return response.ok({
        message: 'Sala atualizada com sucesso',
        data: room
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao atualizar sala',
        details: error.message
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const room = await Room.find(params.id)

      if (!room) {
        return response.notFound({ error: 'Sala não encontrada' })
      }

      await room.delete()

      return response.ok({ message: 'Sala excluída com sucesso' })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao excluir sala',
        details: error.message
      })
    }
  }

  async allocateStudent({ params, request, response }: HttpContext) {
    try {
      const { roomId, studentId } = params
      const teacherId = request.input('teacherId')

      if (!teacherId) {
        return response.badRequest({
          error: 'teacherId é obrigatório no corpo da requisição'
        })
      }

      const room = await Room.query()
        .where('id', roomId)
        .preload('students')
        .first()

      if (!room) {
        return response.notFound({ error: 'Sala não encontrada' })
      }

      if (room.teacherId !== parseInt(teacherId)) {
        return response.forbidden({
          error: 'Você só pode alocar alunos em salas criadas por você'
        })
      }

      if (!room.available) {
        return response.badRequest({
          error: 'Esta sala não está disponível para alocação'
        })
      }

      const student = await Student.find(studentId)
      if (!student) {
        return response.notFound({ error: 'Aluno não encontrado' })
      }

      const isAlreadyAllocated = room.students.some(s => s.id === parseInt(studentId))
      if (isAlreadyAllocated) {
        return response.conflict({
          error: 'Este aluno já está alocado nesta sala'
        })
      }

      if (room.students.length >= room.capacity) {
        return response.badRequest({
          error: 'A sala atingiu sua capacidade máxima de alunos'
        })
      }

      await room.related('students').attach([studentId])

      return response.ok({ message: 'Aluno alocado na sala com sucesso' })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao alocar aluno na sala',
        details: error.message
      })
    }
  }

  async deallocateStudent({ params, request, response }: HttpContext) {
    try {
      const { roomId, studentId } = params
      const teacherId = request.input('teacherId')

      if (!teacherId) {
        return response.badRequest({
          error: 'teacherId é obrigatório no corpo da requisição'
        })
      }

      const room = await Room.query()
        .where('id', roomId)
        .preload('students')
        .first()

      if (!room) {
        return response.notFound({ error: 'Sala não encontrada' })
      }

      if (room.teacherId !== parseInt(teacherId)) {
        return response.forbidden({
          error: 'Você só pode remover alunos de salas criadas por você'
        })
      }

      const isAllocated = room.students.some(s => s.id === parseInt(studentId))
      if (!isAllocated) {
        return response.notFound({
          error: 'Este aluno não está alocado nesta sala'
        })
      }

      await room.related('students').detach([studentId])

      return response.ok({ message: 'Aluno removido da sala com sucesso' })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao remover aluno da sala',
        details: error.message
      })
    }
  }

  async getStudents({ params, response }: HttpContext) {
    try {
      const room = await Room.query()
        .where('id', params.id)
        .preload('students')
        .preload('teacher')
        .first()

      if (!room) {
        return response.notFound({ error: 'Sala não encontrada' })
      }

      return response.ok({
        data: {
          roomNumber: room.roomNumber,
          capacity: room.capacity,
          currentOccupancy: room.students.length,
          teacher: {
            id: room.teacher.id,
            name: room.teacher.name
          },
          students: room.students.map(student => ({
            id: student.id,
            name: student.name,
            email: student.email,
            registration: student.registration
          }))
        }
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao consultar alunos da sala',
        details: error.message
      })
    }
  }
}