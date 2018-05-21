// Generates a referral code consisting of the first X letters of
// the username and Y digits.

function genReferralCode(username: string) {
  const letterStrLength = 3
  const numStrLength = 4
  return getLetterString(letterStrLength).concat(getNumberString(numStrLength))
}

function getLetterString(length: number) {
  let letterString = ''
  const availChars = 'abcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < length; i++) {
    letterString += availChars.charAt(Math.floor(Math.random() * availChars.length))
  }
  return letterString
}

function getNumberString(length: number) {
  let numString = ''
  for (let i = 0; i < length; i++) {
    numString = numString.concat(Math.floor(Math.random() * 10).toString())
  }
  return numString
}

export default genReferralCode
