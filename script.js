const strengthMeter = document.getElementById('strength-meter')
const passwordInput = document.getElementById('password-input')
const weaknessErrorContainer = document.getElementById('weakness-error-container')
const leakedPasswordContainer = document.getElementById('leaked-password')
const strengthMeterPercentage = document.getElementById('strength-meter-percentage')
const noApparentWeakness = document.getElementById('no-apparent-weakness')
const timeToCrack = document.getElementById('time-to-crack')
let totalCharacterSet = 0
let entropyScore = 0

/**
 * The main function is initialized when the button to estimate password strength is pressed.
 */
function updateStrengthMeter() {
  noApparentWeakness.innerText = ""
  timeToCrack.innerText = ""
  leakedPasswordContainer.hidden = true
  totalCharacterSet = 0
  entropyScore = 0

  // Data
  rockyouWeakness(passwordInput.value)

  // Handles characterset calculcations.
  handleLengthFeedback(passwordInput.value)
  handleUpperCaseFeedback(passwordInput.value)
  handleLowerCaseFeedback(passwordInput.value)
  handleDigitFeedback(passwordInput.value)
  handleSymbolFeedback(passwordInput.value)
  handleRepeatFeedback(passwordInput.value)
  handleSequenceFeedback(passwordInput.value)
  handlePatternFeedback(passwordInput.value)
  handleCloseKeyFeedback(passwordInput.value)

  // Calculates a score based on entropy and all relevant weaknesses.
  entropyScore = handleEntropyCalucation(totalCharacterSet, passwordInput.value) - lengthWeakness(passwordInput.value).calculation -
    handleRepeatCharacterEntropy(passwordInput.value) - handleSequenceCharacterEntropy(passwordInput.value) - handlePatternEntropy(passwordInput.value)
    - handleCloseKeyEntropy(passwordInput.value)
  if (entropyScore < 0) {
    entropyScore = 0
  }

  // Changes the color and score of the strength meter based on entropy.
  handleStrengthMeter(entropyScore)

  // Handles the estimated time it takes to guess the password.
  handleTimeToCrack(entropyScore)

  // Gives positive feedback if the entropy score is over 90.
  if (entropyScore > 90) {
    noApparentWeakness.innerText = "Your password is very strong with no detrimental weakness affecting password strength."
    noApparentWeakness.style.color = "lightgreen"
  }
}

// Calculates password entropy based on password length and the used character set.
function handleEntropyCalucation(totalCharacterSet, password) {
  let entropyValue = Math.log2(totalCharacterSet) * password.length || 0
  return entropyValue
}

// Uses the entropy score and an estimated 1,000,000,000 guesses possible per second to 
// estimate the average time it takes to break the password.
function handleTimeToCrack(entropyScore) {
  console.log(entropyScore)
  let maxNumberOfGuesses = Math.pow(2, entropyScore)
  let averageNumberOfGuesses = maxNumberOfGuesses / 2
  let secondsToGuess = averageNumberOfGuesses / 1000000000
  let minutesToGuess = secondsToGuess / 60
  let hoursToGuess = minutesToGuess / 60
  let daysToGuess = hoursToGuess / 24
  let yearsToGuess = daysToGuess / 365

  if (secondsToGuess < 60) {
    if (Math.floor(secondsToGuess) === 1) {
      return timeToCrack.innerText = "It takes an average of " + Math.floor(secondsToGuess) + " second to guess your password."
    }
    return timeToCrack.innerText = "It takes an average of " + Math.floor(secondsToGuess) + " seconds to guess your password."
  }
  if (minutesToGuess >= 1 && minutesToGuess < 60) {
    if (Math.floor(minutesToGuess) === 1) {
      return timeToCrack.innerText = "It takes an average of " + Math.floor(minutesToGuess) + " minute to guess your password."
    }
    return timeToCrack.innerText = "It takes an average of " + Math.floor(minutesToGuess) + " minutes to guess your password."
  }
  if (hoursToGuess < 24) {
    if (Math.floor(hoursToGuess) === 1) {
      return timeToCrack.innerText = "It takes an average of " + Math.floor(hoursToGuess) + " hour to guess your password."
    }
    return timeToCrack.innerText = "It takes an average of " + Math.floor(hoursToGuess) + " hours to guess your password."
  }
  if (daysToGuess < 365) {
    if (Math.floor(daysToGuess) === 1) {
      return timeToCrack.innerText = "It takes an average of " + Math.floor(daysToGuess) + " day to guess your password."
    }
    return timeToCrack.innerText = "It takes an average of " + Math.floor(daysToGuess) + " days to guess your password."
  }
  if (daysToGuess >= 365) {
    if (yearsToGuess > 999999) {

      if (yearsToGuess / 1000000 > 999999) {
        return timeToCrack.innerText = "It takes several billion years to guess your password."
      }

      return timeToCrack.innerText = "It takes an average of " + Math.floor(yearsToGuess / 1000000) + " million years to guess your password."
    }
    if (Math.floor(yearsToGuess) === 1) {
      return timeToCrack.innerText = "It takes an average of " + Math.floor(yearsToGuess) + " year to guess your password."
    }
    return timeToCrack.innerText = "It takes an average of " + Math.floor(yearsToGuess) + " years to guess your password."
  }
}

/*function handleAdditionalBitAllocation(password) {
  let length = password.length
  var additionalEntropy = 0

  if (length > 0) {
    additionalEntropy += 4
  }
  if (length > 1) {
    additionalEntropy += Math.min(length - 1, 7) * 2
  }
  if (length > 8) {
    additionalEntropy += Math.min(length - 8, 12) * 1.5
  }
  var uppercase = /[A-Z]/.test(password)
  var digit = /[0-9]/.test(password)
  var symbol = /[^0-9a-zA-Z\s]/.test(password)
  if (uppercase && digit && symbol) {
    additionalEntropy += 6
  }
  return additionalEntropy
}*/

function clearMessages(input, error, icon) {
  // A white dash symbol is used for uninitianlized weakness functions.
  input.style.color = "white"
  icon.innerHTML = "minimize"
  icon.style.color = "white"
  error.innerHTML = ""
}


function handleWeaknessFeedback(input, error, icon, weakness, override = null) {
  // A red cross symbol is used for factors containing weaknesses.
  if (weakness.message) {
    icon.innerHTML = "cancel"
    icon.style.color = "red"
    error.innerText = weakness.message
    error.style.color = "white"
    // An orange cross symbol is used when the minimun length is upheld, but also indicates
    // potential for improvement.
    if (override === 10) {
      icon.innerHTML = "check_circle"
      icon.style.color = "orange"
    }
    return weakness.calculation
  }
  else {
    // A green check symbol indicates no weaknesses for a given factor.
    icon.innerHTML = "check_circle"
    icon.style.color = "green"
    input.style.color = "lightgreen"
    totalCharacterSet += weakness.calculation
  }
}

// The following nine handle feedback functions updates the Password Criteria symbols and text
// depending on the inclusion of a weakness in the submitted password.
function handleLengthFeedback(password) {
  const lengthFeedbackInput = document.getElementById('length-feedback-input')
  const lengthFeedbackIcon = document.getElementById('length-feedback-icon')
  const lengthFeedbackError = document.getElementById('length-feedback-error')

  clearMessages(lengthFeedbackInput, lengthFeedbackError, lengthFeedbackIcon)

  const weakness = lengthWeakness(password)
  return handleWeaknessFeedback(lengthFeedbackInput, lengthFeedbackError, lengthFeedbackIcon, weakness, weakness.calculation)
}

function handleUpperCaseFeedback(password) {
  const upperCaseFeedbackInput = document.getElementById('uppercase-feedback-input')
  const upperCaseFeedbackIcon = document.getElementById('uppercase-feedback-icon')
  const upperCaseFeedbackError = document.getElementById('uppercase-feedback-error')

  clearMessages(upperCaseFeedbackInput, upperCaseFeedbackError, upperCaseFeedbackIcon)

  const weakness = uppercaseWeakness(password)
  return handleWeaknessFeedback(upperCaseFeedbackInput, upperCaseFeedbackError, upperCaseFeedbackIcon, weakness)
}

function handleLowerCaseFeedback(password) {
  const lowerCaseFeedbackInput = document.getElementById('lowercase-feedback-input')
  const lowerCaseFeedbackIcon = document.getElementById('lowercase-feedback-icon')
  const lowerCaseFeedbackError = document.getElementById('lowercase-feedback-error')

  clearMessages(lowerCaseFeedbackInput, lowerCaseFeedbackError, lowerCaseFeedbackIcon)

  const weakness = lowercaseWeakness(password)
  return handleWeaknessFeedback(lowerCaseFeedbackInput, lowerCaseFeedbackError, lowerCaseFeedbackIcon, weakness)
}

function handleDigitFeedback(password) {
  const digitFeedbackInput = document.getElementById('digit-feedback-input')
  const digitFeedbackIcon = document.getElementById('digit-feedback-icon')
  const digitFeedbackError = document.getElementById('digit-feedback-error')

  clearMessages(digitFeedbackInput, digitFeedbackError, digitFeedbackIcon)

  const weakness = digitWeakness(password)
  return handleWeaknessFeedback(digitFeedbackInput, digitFeedbackError, digitFeedbackIcon, weakness)
}

function handleSymbolFeedback(password) {
  const symbolFeedbackInput = document.getElementById('symbol-feedback-input')
  const symbolFeedbackIcon = document.getElementById('symbol-feedback-icon')
  const symbolFeedbackError = document.getElementById('symbol-feedback-error')

  clearMessages(symbolFeedbackInput, symbolFeedbackError, symbolFeedbackIcon)

  const weakness = symbolWeakness(password)
  return handleWeaknessFeedback(symbolFeedbackInput, symbolFeedbackError, symbolFeedbackIcon, weakness)
}

function handleRepeatFeedback(password) {
  const repeatFeedbackInput = document.getElementById('repeat-feedback-input')
  const repeatFeedbackIcon = document.getElementById('repeat-feedback-icon')
  const repeatFeedbackError = document.getElementById('repeat-feedback-error')

  clearMessages(repeatFeedbackInput, repeatFeedbackError, repeatFeedbackIcon)

  const weakness = repeatCharactersWeakness(password)
  if (password && weakness) {
    return handleWeaknessFeedback(repeatFeedbackInput, repeatFeedbackError, repeatFeedbackIcon, weakness)
  }
}

function handleSequenceFeedback(password) {
  const sequenceFeedbackInput = document.getElementById('sequence-feedback-input')
  const sequenceFeedbackIcon = document.getElementById('sequence-feedback-icon')
  const sequenceFeedbackError = document.getElementById('sequence-feedback-error')

  clearMessages(sequenceFeedbackInput, sequenceFeedbackError, sequenceFeedbackIcon)

  const weakness = sequenceCharactersWeakness(password)
  if (password && weakness) {
    return handleWeaknessFeedback(sequenceFeedbackInput, sequenceFeedbackError, sequenceFeedbackIcon, weakness)
  }
}

function handlePatternFeedback(password) {
  const patternFeedbackInput = document.getElementById('pattern-feedback-input')
  const patternFeedbackIcon = document.getElementById('pattern-feedback-icon')
  const patternFeedbackError = document.getElementById('pattern-feedback-error')

  clearMessages(patternFeedbackInput, patternFeedbackError, patternFeedbackIcon)

  const weakness = patternWeakness(password)
  if (password && weakness) {
    return handleWeaknessFeedback(patternFeedbackInput, patternFeedbackError, patternFeedbackIcon, weakness)
  }
}

function handleCloseKeyFeedback(password) {
  const closeKeyFeedbackInput = document.getElementById('close-key-feedback-input')
  const closeKeyFeedbackIcon = document.getElementById('close-key-feedback-icon')
  const closeKeyFeedbackError = document.getElementById('close-key-feedback-error')

  clearMessages(closeKeyFeedbackInput, closeKeyFeedbackError, closeKeyFeedbackIcon)

  const weakness = closeKeyWeakness(password)
  console.log("closekey: ", weakness)
  if (password && weakness) {
    return handleWeaknessFeedback(closeKeyFeedbackInput, closeKeyFeedbackError, closeKeyFeedbackIcon, weakness)
  }
}

// Changes the color of the strength meter depending on the password score,
// providing the user with visual feedback of the password strength.
function handleStrengthMeter(strength) {
  if (strength < 0) {
    strength = 0
  }
  strength = Math.floor(strength)
  // Upper cap of 100 to limit the score for visual clarity.
  if (strength > 100) {
    strength = 100
  }

  strengthMeter.style.setProperty('--strength', strength)
  strengthMeterPercentage.innerText = `${strength}/100`

  if (strength <= 20) {
    strengthMeter.style.setProperty('--color', "red")
  }
  if (strength > 20 && strength <= 40) {
    strengthMeter.style.setProperty('--color', "orange")
  }
  if (strength > 40 && strength <= 60) {
    strengthMeter.style.setProperty('--color', "yellow")
  }
  if (strength > 60 && strength <= 80) {
    strengthMeter.style.setProperty('--color', "palegreen")
  }
  if (strength > 80) {
    strengthMeter.style.setProperty('--color', "green")
  }
}

// This function creates an array where all the weaknesses are listed.
// The array is then forwarded to the main function, and any apparent weaknesses
// will be used to calculate password strength.
function calculatePasswordStrength(password) {
  const weaknesses = []
  weaknesses.push(lowercaseWeakness(password))
  weaknesses.push(uppercaseWeakness(password))
  weaknesses.push(digitWeakness(password))
  weaknesses.push(symbolWeakness(password))
  weaknesses.push(repeatCharactersWeakness(password))
  weaknesses.push(sequenceCharactersWeakness(password))
  weaknesses.push(patternWeakness(password))
  weaknesses.push(closeKeyWeakness(password))
  return weaknesses
}

// This function returns a weakness message depending on the password length.
// A value of 7 or lower gives a major deduction, and a value between 8 and 11 gives a minor deduction.
// Password length is emphasized to have significant impact in determining password strength.
function lengthWeakness(password) {
  const length = password.length
  if (length <= 7) {
    return {
      message: 'Your password is way too short. Using this few characters makes it very easy to guess your password. Try to include at least 8-10 characters.',
      calculation: 20
    }
  }
  if (length <= 11) {
    return {
      message: 'Your password could still be longer. Using 12 or more characters is preferable and ensures good password strength.',
      calculation: 10
    }
  }
  return {
    message: null,
    calculation: 0
  }
}

// The following four functions utilizes regular expressions and creates individual instances of the inclusion
// of uppercase letters, lowercase letters, digits, and symbols in the chosen password respectively.
// They are used to calculate entropy based on the utilized character set in the password.
// Each singular apparance of an uppercase, lowercase, digit or symbol character will increase the character set by
// 26, 26, 10, and 32 respectively, potentially achieveing a total character set of 94.
function uppercaseWeakness(password) {
  const weakness = characterTypeWeakness(password, /[A-Z]/g, 'uppercase characters')
  if (weakness) {
    return {
      message: weakness,
      calculation: 0
    }
  }
  return {
    message: null,
    calculation: 26
  }
}

function lowercaseWeakness(password) {
  const weakness = characterTypeWeakness(password, /[a-z]/g, 'lowercase characters')
  if (weakness) {
    return {
      message: weakness,
      calculation: 0
    }
  }
  return {
    message: null,
    calculation: 26
  }
}

function digitWeakness(password) {
  const weakness = characterTypeWeakness(password, /[0-9]/g, 'digits')
  if (weakness) {
    return {
      message: weakness,
      calculation: 0
    }
  }
  return {
    message: null,
    calculation: 10
  }
}

function symbolWeakness(password) {
  const weakness = characterTypeWeakness(password, /[^0-9a-zA-Z\s]/g, 'symbols')
  if (weakness) {
    return {
      message: weakness,
      calculation: 0
    }
  }
  return {
    message: null,
    calculation: 32
  }
}

/**
 * This function utilizes the four functions above as pointers in order to return a message
 * depending on if the type of character is not used in the password.
 * 
 * @param {string} password 
 * @param {RegExp} regex 
 * @param {string} type 
 * @returns 
 */
function characterTypeWeakness(password, regex, type) {
  const matches = password.match(regex) || []
  if (matches.length === 0) {
    return `Your password contains no ${type}.`
  }
}

/**
 * This function uses regular expressions in order to call out instances of two characters being used in a row
 * and then provides a deduction depending of the number of subsequent matches.
 * 
 * @param {string} password 
 * @returns 
 */
function repeatCharactersWeakness(password) {
  const twoMatches = password.match(/(.)\1\1/g) || []
  const oneMatch = password.match(/(.)\1/g) || []
  if (password.length >= 3) {
    // Returns here if three of the same character has been used in a row.
    if (twoMatches.length > 0) {
      return {
        message: 'Your password contains multiple repeated characters. Try making a unique password using a more diverse set of characters.',
        calculation: 20
      }
    }
    // Returns here if two of the same character has been used in a row.
    if (oneMatch.length > 0) {
      return {
        message: 'Your password contains some repeated characters. Making sure to include many unique characters will strengthen your password.',
        calculation: 10
      }
    }
    // Returns here if no repeated characters are used.
    return {
      message: null,
      calculation: 0
    }
  }
}

function handleRepeatCharacterEntropy(password) {
  const weakness = repeatCharactersWeakness(password)
  if (weakness) {
    return weakness.calculation
  }
}

/**
 * This functions transforms the used characters to ASCII characters, and looks for sequences
 * 
 * @param {string} password 
 * @returns 
 */
function sequenceCharactersWeakness(password) {
  let asciiValues = password.split('').map(char => char.charCodeAt(0));
  let ascendingSequence = false
  let descendingSequence = false

  // Check for sequences of 3 ASCII characters in a row
  if (password.length >= 3) {
    for (let i = 0; i < asciiValues.length - 2; i++) {
      if (asciiValues[i] + 1 === asciiValues[i + 1] && asciiValues[i + 1] + 1 === asciiValues[i + 2]) {
        ascendingSequence = true
      } else if (asciiValues[i] - 1 === asciiValues[i + 1] && asciiValues[i + 1] - 1 === asciiValues[i + 2]) {
        descendingSequence = true
      }
    }
    // Exits the if function if both ascending and descending weaknesses are found.
    if (ascendingSequence && descendingSequence) {
      return {
        message: 'Your password contains both ascending and descending sequences of 3 characters. Using several sequences makes it much easier to guess.',
        calculation: 25
      }
      // Exits here if either weakness are found.
    } else if (ascendingSequence || descendingSequence) {
      return {
        message: 'Your password contains a sequence of 3 characters. Using sequences weakens your password by making it more predictable.',
        calculation: 15
      }
      // Returns here if no sequences are used.
    } else {
      return {
        message: null,
        calculation: 0
      }
    }
  }
}

function handleSequenceCharacterEntropy(password) {
  const weakness = sequenceCharactersWeakness(password)

  return weakness.calculation
}

function patternWeakness(password) {
  // Stores all seen patterns of length 3 and up.
  const knownPatterns = new Set();

  // Looks for patterns starting with length 3 up to half of the total password length.
  for (let patternLength = 3; patternLength <= password.length / 2; patternLength++) {
    for (let i = 0; i <= password.length - patternLength; i++) {
      const pattern = password.substring(i, i + patternLength);
      if (knownPatterns.has(pattern)) {
        return {
          message: 'Your password contains repeated sections. Avoid repeating patterns to strengthen your password.',
          calculation: 20
        };
      } else {
        knownPatterns.add(pattern);
      }
    }
  }
  return {
    message: null,
    calculation: 0
  };
}

function handlePatternEntropy(password) {
  const weakness = patternWeakness(password)

  return weakness.calculation
}

function closeKeyWeakness(password) {
  // A minimum length of 5 allows some flexibility when using constructing passwords normally.
  const minSequenceLength = 5
  // Define a mapping of same and adjacent keys on an English QWERTY keyboard
  // including numbers and some symbols which could be used to form patterns.
  const adjacencyMap = {
    '1': ['1', '!', '2', '"', 'q'],
    '2': ['1', '!', '2', '"', '3', '#', 'q', 'w'],
    '3': ['2', '"', '3', '#', '4', '¤', 'w', 'e'],
    '4': ['3', '#', '4', '¤', '5', '%', 'e', 'r'],
    '5': ['4', '¤', '5', '%', '6', '&', 'r', 't'],
    '6': ['5', '%', '6', '&', '7', '/', 't', 'y'],
    '7': ['6', '&', '7', '/', '8', '(', 'y', 'u'],
    '8': ['7', '/', '8', '(', '9', ')', 'u', 'i'],
    '9': ['8', '(', '9', ')', '0', '=', 'i', 'o'],
    '0': ['9', ')', '0', '=', '+', '?', 'o', 'p'],
    'q': ['1', '!', '2', '"', 'q', 'w', 'a'],
    'w': ['2', '"', '3', '#', 'q', 'w', 'e', 'a', 's'],
    'e': ['3', '#', '4', '¤', 'e', 'w', 'r', 's', 'd'],
    'r': ['4', '¤', '5', '%', 'r', 'e', 't', 'd', 'f'],
    't': ['5', '%', '6', '&', 't', 'r', 'y', 'f', 'g'],
    'y': ['6', '&', '7', '/', 'y', 't', 'u', 'g', 'h'],
    'u': ['7', '/', '8', '(', 'u', 'y', 'i', 'h', 'j'],
    'i': ['8', '(', '9', ')', 'i', 'u', 'o', 'j', 'k'],
    'o': ['9', ')', '0', '=', 'o', 'i', 'p', 'k', 'l'],
    'p': ['0', '=', '+', '?', 'p', 'o', 'l'],
    'a': ['a', 'q', 'w', 's', '<', '>', 'z'],
    's': ['s', 'w', 'e', 'a', 'd', 'z', 'x'],
    'd': ['d', 'e', 'r', 's', 'f', 'x', 'c'],
    'f': ['f', 'r', 't', 'd', 'g', 'c', 'v'],
    'g': ['g', 't', 'y', 'f', 'h', 'v', 'b'],
    'h': ['h', 'y', 'u', 'g', 'j', 'b', 'n'],
    'j': ['j', 'u', 'i', 'h', 'k', 'n', 'm'],
    'k': ['k', 'i', 'o', 'j', 'l', 'm', ',', ';'],
    'l': ['l', 'o', 'p', 'k', ',', ';', '.', ':'],
    'z': ['z', 'a', 's', '<', '>', 'x'],
    'x': ['x', 's', 'd', 'z', 'c'],
    'c': ['c', 'd', 'f', 'x', 'v'],
    'v': ['v', 'f', 'g', 'c', 'b'],
    'b': ['b', 'g', 'h', 'v', 'n'],
    'n': ['n', 'h', 'j', 'b', 'm'],
    'm': ['m', 'j', 'k', 'n', ',', ';']
  };

  // Check for sequences of characters that are closely located on a keyboard
  for (let i = 0; i < password.length - (minSequenceLength - 1); i++) {
    const substring = password.substring(i, i + minSequenceLength).toLowerCase()
    let hasCloseKeys = true
    for (let j = 0; j < minSequenceLength - 1; j++) {
      const char1 = substring[j]
      const char2 = substring[j + 1]
      // Checks if the second character is within the range of the first on a keyboard.
      if (!adjacencyMap[char1] || !adjacencyMap[char1].includes(char2)) {
        hasCloseKeys = false
        break
      }
    }
    // Returns here if there are 5 or more characters in the password being adjacent to one another
    if (hasCloseKeys) {
      return {
        message: 'Your password uses keyboard sequences, and should not be used to artificially lengthen passwords. Instead use a word or phrase unique to you.',
        calculation: 20
      }
    }
  }
  // Return here if no patters are used.
  return {
    message: null,
    calculation: 0
  }
}

function handleCloseKeyEntropy(password) {
  const weakness = closeKeyWeakness(password)

  return weakness.calculation
}

// This function takes the input from the user and tries to match it with every entry in the RockYou dataset.
// If it finds a match, it deducts all points from the password score.
function rockyouWeakness(password) {
  fetch("rockyou.txt")
    .then((res) => res.text())
    .then((text) => {
      const leakedArray = text.split('\n')
      if (leakedArray.includes(password)) {
        strengthMeter.style.setProperty('--strength', strength = 0)
        strengthMeterPercentage.innerText = `${strength}/100`
        return leakedPasswordContainer.hidden = false
      }
    })
    .catch((e) => console.error(e))
    .finally(() => {
    })
}

