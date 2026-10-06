import { describe, expect, it } from 'vitest'
import { slotsOcupadosPorDuracao, TIME_SLOTS } from './dateUtils'

describe('slotsOcupadosPorDuracao', () => {
  it('serviço de 30min ocupa só 1 slot (30+5=35 < gap de 45min)', () => {
    expect(slotsOcupadosPorDuracao('09:00', 30, TIME_SLOTS)).toEqual(['09:00'])
  })

  it('serviço de 40min ainda ocupa só 1 slot (40+5=45, o gap exato não vaza pro próximo)', () => {
    expect(slotsOcupadosPorDuracao('09:00', 40, TIME_SLOTS)).toEqual(['09:00'])
  })

  it('serviço de 41min ocupa 2 slots (41+5=46 > 45)', () => {
    expect(slotsOcupadosPorDuracao('09:00', 41, TIME_SLOTS)).toEqual(['09:00', '09:45'])
  })

  it('cabelo (30min) + barba (20min) = 50min → 2 slots', () => {
    expect(slotsOcupadosPorDuracao('09:00', 50, TIME_SLOTS)).toEqual(['09:00', '09:45'])
  })

  it('serviço de 85min ocupa 2 slots (85+5=90, gap exato de 45+45=90)', () => {
    expect(slotsOcupadosPorDuracao('09:00', 85, TIME_SLOTS)).toEqual(['09:00', '09:45'])
  })

  it('serviço de 86min ocupa 3 slots (86+5=91 > 90)', () => {
    expect(slotsOcupadosPorDuracao('09:00', 86, TIME_SLOTS)).toEqual(['09:00', '09:45', '10:30'])
  })

  it('horário antes do almoço: slot 11:15 com 90min loca 11:15 + 12:00 (gap almoço é 90min)', () => {
    // restante=95: 95-45=50>0 → push 12:00; 50-90=-40 → para
    expect(slotsOcupadosPorDuracao('11:15', 90, TIME_SLOTS)).toEqual(['11:15', '12:00'])
  })

  it('horário não cadastrado na grade retorna só o próprio horário', () => {
    expect(slotsOcupadosPorDuracao('10:00', 30, TIME_SLOTS)).toEqual(['10:00'])
  })

  it('último slot da grade não vaza além do fim do dia', () => {
    expect(slotsOcupadosPorDuracao('18:45', 60, TIME_SLOTS)).toEqual(['18:45'])
  })
})
