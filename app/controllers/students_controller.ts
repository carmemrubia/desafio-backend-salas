import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'
import { DateTime } from 'luxon'

export default class StudentsController {
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['name', 'email', 'registration', 'birthDate'])
      
      if (!data.name || !data.email || !data.registration || !data.birthDate) {
        return response.badRequest({
          error: 'Todos os campos são obrigatórios: name, email, registration, birthDate'
        })
      }

      const existingEmail = await Student.findBy('email', data.email)
      if (existingEmail) {
        return response.conflict({ error: 'Email já cadastrado' })
      }

      const existingRegistration = await Student.findBy('registration', data.registration)
      if (existingRegistration) {
        return response.conflict({ error: 'Matrícula já cadastrada' })
      }

      const student = await Student.create({
        ...data,
        birthDate: DateTime.fromISO(data.birthDate)
      })

      return response.created({
        message: 'Aluno cadastrado com sucesso',
        data: student
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao cadastrar aluno',
        details: error.message
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const student = await Student.find(params.id)

      if (!student) {
        return response.notFound({ error: 'Aluno não encontrado' })
      }

      return response.ok({ data: student })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao consultar aluno',
        details: error.message
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const student = await Student.find(params.id)

      if (!student) {
        return response.notFound({ error: 'Aluno não encontrado' })
      }

      const data = request.only(['name', 'email', 'registration', 'birthDate'])

      if (data.email && data.email !== student.email) {
        const existingEmail = await Student.findBy('email', data.email)
        if (existingEmail) {
          return response.conflict({ error: 'Email já cadastrado' })
        }
      }

      if (data.registration && data.registration !== student.registration) {
        const existingRegistration = await Student.findBy('registration', data.registration)
        if (existingRegistration) {
          return response.conflict({ error: 'Matrícula já cadastrada' })
        }
      }

      student.merge({
        ...data,
        birthDate: data.birthDate ? DateTime.fromISO(data.birthDate) : student.birthDate
      })
      
      await student.save()

      return response.ok({
        message: 'Dados do aluno atualizados com sucesso',
        data: student
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao atualizar aluno',
        details: error.message
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const student = await Student.find(params.id)

      if (!student) {
        return response.notFound({ error: 'Aluno não encontrado' })
      }

      await student.delete()

      return response.ok({ message: 'Aluno excluído com sucesso' })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao excluir aluno',
        details: error.message
      })
    }
  }

  async getRooms({ params, response }: HttpContext) {
    try {
      const student = await Student.query()
        .where('id', params.id)
        .preload('rooms', (roomQuery) => {
          roomQuery.preload('teacher')
        })
        .first()

      if (!student) {
        return response.notFound({ error: 'Aluno não encontrado' })
      }

      const formattedResponse = {
        studentName: student.name,
        rooms: student.rooms.map(room => ({
          teacherName: room.teacher.name,
          roomNumber: room.roomNumber
        }))
      }

      return response.ok({ data: formattedResponse })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao consultar salas do aluno',
        details: error.message
      })
    }
  }
}