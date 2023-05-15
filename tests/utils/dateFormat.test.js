const {DateFormat} = require('../../utils/dateFormat')

test('Properly Add & Diff operation for Days, Months, and Year', async () => {

    let date = new DateFormat("2023-01-01T07:00:00.000Z")
    date.addDays = 20
    date.addMonths = 12
    date.addYears = 2
    date.addHours = 4
    date.addMinutes = 30

    let today = new DateFormat()

    let diffDays = date.diffDays("2027-01-21T11:30:00.000Z")

    let invalidDate = new DateFormat("this is invalid date")
    let invalidDiffDays = invalidDate.diffDays("2027-01-21T11:30:00.000Z")
    
    // check date with and without time in ISO Format
    expect(date.toISOString(isTime = true)).toEqual("2026-01-21T11:30:00.000Z")
    expect(date.toISOString(isTime = false)).toEqual("2026-01-21")

    // check date with and without time in Locale Format (default = Bahasa Indonesia)
    expect(date.toLocaleString(isTime = true)).toEqual("Rabu, 21 Januari 2026 pukul 18.30")
    expect(date.toLocaleString(isTime = false)).toEqual("Rabu, 21 Januari 2026")

    // check date with and without time in Locale Format en-us
    expect(date.toLocaleString(isTime = true, language = 'en-us')).toEqual("Wednesday, January 21, 2026 at 6:30 PM")
    expect(date.toLocaleString(isTime = false, language = 'en-us')).toEqual("Wednesday, January 21, 2026")

    // check how many days beetwen 2026-01-21 and 2027-01-21
    expect(diffDays).toEqual(365)

    // check if date is invalid
    expect(invalidDate.toLocaleString()).toEqual('Invalid date')
    expect(invalidDate.toISOString()).toEqual('Invalid date')
    expect(invalidDiffDays).toEqual('Invalid date')

})