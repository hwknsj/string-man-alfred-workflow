#!/usr/bin/env osascript -l JavaScript

function run(argv) {
  const input = argv[0]

  const WORD = /[a-zA-Z0-9]+/g
  const ARGUMENT = /(?:'([^'"]*)'|"([^'"]*)")/g
  const COMMAND_SEPARATOR = ' /'

  let items = []

  const toPascalCase = (string = '') =>
    string
      .replace(/[-_]+/g, ' ') // Replace kebab-case and snake_case with spaces
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle camelCase and PascalCase
      .trim() // Remove leading and trailing whitespace
      .split(/\s+/) // Split the string into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
      .join('') // Join the words together

  const toLowerCase = (string = '') => {
    return string.toLowerCase()
  }

  const toUpperCase = (string = '') => {
    return string.toUpperCase()
  }

  const toCamelCase = (string = '') =>
    string
      .replace(/[-_]+/g, ' ') // Replace kebab-case and snake_case with spaces
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle CamelCase and PascalCase
      .trim() // Remove leading and trailing whitespace
      .split(/\s+/) // Split the string into words
      .map((word, i) => {
        // Capitalize the first letter of each word except the first one
        if (i === 0) {
          return word.toLowerCase() // First word should be lowercase
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize the rest
      })
      .join('') // Join the words together

  const toSnakeCase = (string = '') =>
    string
      .replace(/([a-z])([A-Z])/g, '$1_$2') // Handle CamelCase and PascalCase
      .replace(/[-\s]+/g, '_') // Replace kebab-case and spaces with underscores
      .toLowerCase() // Convert to lowercase
      .replace(/[^a-z0-9_]/g, '') // Remove non-alphanumeric characters (except underscores)
      .replace(/__+/g, '_') // Replace multiple underscores with a single underscore
      .replace(/^_|_$/g, '') // Remove leading and trailing underscores

  const toKebabCase = (string = '') =>
    string
      .replace(/([a-z])([A-Z])/g, '$1-$2') // Insert a hyphen between lowercase and uppercase letters
      .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
      .toLowerCase() // Convert to lowercase
      .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters (except hyphens)
      .replace(/--+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-|-$/g, '') // Remove leading and trailing hyphens

  const toTrimmed = (string = '') => {
    return string.trim()
  }

  const toCapitalized = (string = '') => {
    const wordChar = /[a-zA-Z_]/
    let previousChar = ''
    let capitalized = ''

    for (let i = 0; i < string.length; i++) {
      const currentChar = string.charAt(i)
      capitalized +=
        !wordChar.test(previousChar) && wordChar.test(currentChar)
          ? currentChar.toLocaleUpperCase()
          : currentChar
      previousChar = currentChar
    }

    return capitalized
  }

  const toCapitalCase = (string = '') =>
    string
      .split(/(?=[A-Z])|(?<=[a-z])(?=[A-Z])|(?<=[^A-Za-z])(?=[A-Za-z])/) // Split on boundaries between words
      .map(word => {
        // Capitalize the first letter and concatenate it with the rest of the word
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join(' ')

  const toSlug = (string = '', separator = '-') => {
    return string
      .replace(/([a-z])([A-Z])/g, '$1-$2') // Handle CamelCase and PascalCase
      .replace(/[\s_]+/g, separator) // Replace spaces and underscores with hyphens
      .toLowerCase() // Convert to lowercase
      .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters (except hyphens)
      .replace(/--+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-|-$/g, '') // Remove leading and trailing hyphens
  }

  const toReplaced = (string = '', substring, replacement = '') => {
    return string.replaceAll(substring, replacement)
  }

  const toFilename = (string = '', extension = '') => {
    const kebab = toKebabCase(string)
    const ext = extension.startsWith('.') ? extension : `.${extension}`
    return `${kebab}${ext}`
  }

  const toDecodeURI = (string = '') => decodeURIComponent(string)

  const toEncodeURI = (string = '') => encodeURIComponent(string)

  const noArgCommands = {
    l: {
      name: 'lowercase',
      transform: toLowerCase
    },
    u: {
      name: 'UPPERCASE',
      transform: toUpperCase
    },
    c: {
      name: 'camelCase',
      transform: toCamelCase
    },
    p: {
      name: 'PascalCase',
      transform: toPascalCase
    },
    s: {
      name: 'snake_case',
      transform: toSnakeCase
    },
    k: {
      name: 'kebab-case',
      transform: toKebabCase
    },
    t: {
      name: 'Trim',
      transform: toTrimmed
    },
    a: {
      name: 'Capitalize',
      transform: toCapitalized
    },
    b: {
      name: 'CapitalCase',
      transform: toCapitalCase
    },
    d: {
      name: 'decode-uri',
      transform: toDecodeURI
    },
    e: {
      name: 'encode-uri',
      transform: toEncodeURI
    }
  }

  const REQUIRED_ARGUMENT = ' (?:\'.*?\'|".*?")'
  const OPTIONAL_ARGUMENT = '(?: \'.*?\'| ".*?")?'

  const argCommands = {
    S: {
      name: 'slugify',
      hint: `Takes one argument: ${COMMAND_SEPARATOR}S '<separator>'`,
      transform: toSlug,
      args: 1,
      pattern: `S${OPTIONAL_ARGUMENT}`
    },
    R: {
      name: 'replace',
      hint: `Takes two arguments: ${COMMAND_SEPARATOR}R '<substring>' '<replacement>'`,
      transform: toReplaced,
      args: 2,
      pattern: `R${REQUIRED_ARGUMENT}${OPTIONAL_ARGUMENT}`
    },
    F: {
      name: 'file-name',
      hint: `Takes two arguments: ${COMMAND_SEPARATOR}F '<filename>' '<extension?>'`,
      transform: toFilename,
      args: 2,
      pattern: `F${REQUIRED_ARGUMENT}${OPTIONAL_ARGUMENT}`
    }
  }

  const allCommands = {
    ...noArgCommands,
    ...argCommands
  }

  const AVAILABLE_COMMANDS = new RegExp(
    `[${Object.keys(noArgCommands).join('')}]{1}|${Object.values(argCommands)
      .map(({ pattern }) => pattern)
      .join('|')}`,
    'g'
  )

  const runTransforms = (input, commandsSequence) => {
    if (Array.isArray(commandsSequence) && commandsSequence.length > 0) {
      return commandsSequence.reduce((result, command) => {
        const transformer = allCommands[command[0]]

        if (!transformer) {
          return result
        }

        if (transformer.args && command.length > 1) {
          const commandArgs = [...command.matchAll(ARGUMENT)].map(
            argMatch => argMatch[1] ?? argMatch[2]
          ) // matching single or double quotes
          return transformer.transform.apply(null, [result, ...commandArgs])
        }

        return transformer.transform(result)
      }, input)
    }

    return input
  }

  const getCommandSequencePath = commandsSequence => {
    if (Array.isArray(commandsSequence) && commandsSequence.length > 0) {
      return commandsSequence.reduce((result, command) => {
        const transformer = allCommands[command[0]]
        if (transformer) {
          result.push(transformer.name)
        }
        return result
      }, [])
    }
  }

  const isMultiline = (string = '') => /(?:\n|\r)+/.test(string)
  const splitInput = (input || '').split(COMMAND_SEPARATOR)

  const string =
    splitInput.length > 2
      ? splitInput.slice(0, splitInput.length - 1).join(COMMAND_SEPARATOR)
      : splitInput[0]
  const commandsSequence =
    splitInput.length > 1
      ? splitInput[splitInput.length - 1].match(AVAILABLE_COMMANDS)
      : null

  if (commandsSequence) {
    const path = getCommandSequencePath(commandsSequence)
    const subtitle = path.join('→')
    const icon = {
      path: './icons/chained.png'
    }
    try {
      const chainResult = runTransforms(string, commandsSequence)
      items = [
        {
          uid: 'chained',
          title: isMultiline(chainResult) ? 'Multiline output' : chainResult,
          subtitle,
          arg: chainResult,
          icon
        }
      ]
    } catch {
      items = [
        {
          uid: 'error',
          title: 'Error',
          subtitle,
          arg: string,
          icon
        }
      ]
    }
  } else {
    items = Object.values(allCommands).map(command => {
      try {
        const transformed = command.transform(string)

        return {
          uid: command.name.toLowerCase(),
          title: isMultiline(transformed) ? 'Multiline output' : transformed,
          subtitle: command.hint
            ? `${command.name}. ${command.hint}`
            : command.name,
          arg: transformed,
          icon: {
            path: `./icons/${command.name}.png`
          }
        }
      } catch {
        return {}
      }
    })
  }

  return JSON.stringify({
    items
  })
}
