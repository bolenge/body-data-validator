const { is_tel } = require('../../lib/helpers')

describe('Func is_tel', () => {
  it('Should correct a phone number with country code', () => {
    const tel = '+243826302208'

    expect(is_tel(tel)).toBeTruthy()
  })

  it('Should correct phone number with ten digits', () => {
    const tel = '0898723456'

    expect(is_tel(tel)).toBeTruthy()
  })

  it('Should bad phone number', () => {
    const tel = '24d3826302208'

    expect(is_tel(tel)).toBe(false)
  })
})