import { describe, expect, it } from 'vitest'
import { slotsOcupadosPorDuracao, TIME_SLOTS } from './dateUtils'

describe('slotsOcupadosPorDuracao', () => {
  it('serviço de 10min ocupa só 1 slot (10 < gap de 15min, sem descanso extra)', () => {
    expect(slotsOcupadosPorDuracao('09:00', 10, TIME_SLOTS)).toEqual(['09:00'])
  })

  it('serviço de 15min ainda ocupa só 1 slot (15 = gap exato, não vaza)', () => {
    expect(slotsOcupadosPorDuracao('09:00', 15, TIME_SLOTS)).toEqual(['09:00'])
  })

  it('serviço de 16min ocupa 2 slots (16 > 15)', () => {
    expect(slotsOcupadosPorDuracao('09:00', 16, TIME_SLOTS)).toEqual(['09:00', '09:15'])
  })

  it('serviço de 20min ocupa 2 slots (20 > 15)', () => {
    expect(slotsOcupadosPorDuracao('09:00', 20, TIME_SLOTS)).toEqual(['09:00', '09:15'])
  })

  it('serviço de 30min ocupa 2 slots (30 = 2x15, gap exato não vaza)', () => {
    expect(slotsOcupadosPorDuracao('09:00', 30, TIME_SLOTS)).toEqual(['09:00', '09:15'])
  })

  it('combo 50min ocupa 4 slots (50 > 45, cabe exatamente no 4º)', () => {
    expect(slotsOcupadosPorDuracao('09:00', 50, TIME_SLOTS)).toEqual(['09:00', '09:15', '09:30', '09:45'])
  })

  it('horário antes do almoço: 12:00 com 50min não vaza (gap almoço é 60min)', () => {
    expect(slotsOcupadosPorDuracao('12:00', 50, TIME_SLOTS)).toEqual(['12:00'])
  })

  it('horário não cadastrado na grade retorna só o próprio horário', () => {
    expect(slotsOcupadosPorDuracao('10:07', 30, TIME_SLOTS)).toEqual(['10:07'])
  })

  it('último slot da grade não vaza além do fim do dia', () => {
    expect(slotsOcupadosPorDuracao('19:00', 60, TIME_SLOTS)).toEqual(['19:00'])
  })
})
