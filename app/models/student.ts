import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Room from './room.js'

export default class Student extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare registration: string

  @column.date()
  declare birthDate: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Room, {
    pivotTable: 'allocations',
    pivotForeignKey: 'student_id',
    pivotRelatedForeignKey: 'room_id',
    pivotTimestamps: true,
  })
  declare rooms: ManyToMany<typeof Room>
}