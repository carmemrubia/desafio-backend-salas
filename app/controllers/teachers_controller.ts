import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import { DateTime } from 'luxon'

export default class TeachersController {
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['name', 'email', 'registration', 'birthDate'])
      
      if (!data.name || !data.email || !data.registration || !data.birthDate) {
        return response.badRequest({
          error: 'Todos os campos são obrigatórios: name, email, registration, birthDate'
        })
      }

      const existingEmail = await Teacher.findBy('email', data.email)
      if (existingEmail) {
        return response.conflict({ error: 'Email já cadastrado' })
      }

      const existingRegistration = await Teacher.findBy('registration', data.registration)
      if (existingRegistration) {
        return response.conflict({ error: 'Matrícula já cadastrada' })
      }

      const teacher = await Teacher.create({
        ...data,
        birthDate: DateTime.fromISO(data.birthDate)
      })

      return response.created({
        message: 'Professor cadastrado com sucesso',
        data: teacher
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao cadastrar professor',
        details: error.message
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const teacher = await Teacher.find(params.id)

      if (!teacher) {
        return response.notFound({ error: 'Professor não encontrado' })
      }

      return response.ok({ data: teacher })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao consultar professor',
        details: error.message
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const teacher = await Teacher.find(params.id)

      if (!teacher) {
        return response.notFound({ error: 'Professor não encontrado' })
      }

      const data = request.only(['name', 'email', 'registration', 'birthDate'])

      if (data.email && data.email !== teacher.email) {
        const existingEmail = await Teacher.findBy('email', data.email)
        if (existingEmail) {
          return response.conflict({ error: 'Email já cadastrado' })
        }
      }

      if (data.registration && data.registration !== teacher.registration) {
        const existingRegistration = await Teacher.findBy('registration', data.registration)
        if (existingRegistration) {
          return response.conflict({ error: 'Matrícula já cadastrada' })
        }
      }

      teacher.merge({
        ...data,
        birthDate: data.birthDate ? DateTime.fromISO(data.birthDate) : teacher.birthDate
      })
      
      await teacher.save()

      return response.ok({
        message: 'Dados do professor atualizados com sucesso',
        data: teacher
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao atualizar professor',
        details: error.message
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const teacher = await Teacher.find(params.id)

      if (!teacher) {
        return response.notFound({ error: 'Professor não encontrado' })
      }

      await teacher.delete()

      return response.ok({ message: 'Professor excluído com sucesso' })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao excluir professor',
        details: error.message
      })
    }
  }
}