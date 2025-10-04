import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Teacher from './teacher.js'
import Student from './student.js'

export default class Room extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare roomNumber: string

  @column()
  declare capacity: number

  @column()
  declare available: boolean

  @column()
  declare teacherId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Teacher)
  declare teacher: BelongsTo<typeof Teacher>

  @manyToMany(() => Student, {
    pivotTable: 'allocations',
    pivotForeignKey: 'room_id',
    pivotRelatedForeignKey: 'student_id',
    pivotTimestamps: true,
  })
  declare students: ManyToMany<typeof Student>
}