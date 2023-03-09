let states = { }

const validations = () => {
  let hasTransitions = false
  let hasStart = false
  let hasFinal = false

  if (document.querySelector('div.input_data div.data').children.length < 1)
    return alert('Necesitas agregar minimo una palabra')
  
  if (Object.keys(states).length < 2)
    return alert('Debes tener al menos 2 states en el area')

  Object.values(states).forEach(state => Object.keys(state.transitions).length > 0 ? hasTransitions = true : false)

  if (!hasTransitions)
    return alert('Debes de tener al menos una transición')

  Object.values(states).forEach(state => {
    if (state.isInitial)
      hasStart = true
    if (state.isFinal)
      hasFinal = true
  })

  if (!hasStart || !hasFinal)
    return alert('Debes de definir un estado inicial y un final')

  return true
}

const undefinedFindWord = (letters, stack, [selected, position]) => {
  let lettering = [...letters]

  lettering.splice(0, position)

  for (const [index, single] of lettering.entries()) {
    if (!states[selected].transitions[single])
      return stack.length > 0 ? emptyStack(stack.pop()) : false

    let transitions = [...states[selected].transitions[single]]
    
    transitions.length > 1
    ? (selected = transitions.shift(), transitions.forEach(state => stack.push([state, index])))
    : selected = transitions[0]

    if(index === lettering.length - 1 && !states[selected].isFinal)
      return stack.length > 0 ? emptyStack(stack.pop()) : false
  }

  return states[selected].isFinal
}

const definedFindWord = () => {

}

document.querySelector('button#data_analyze').addEventListener('click', () => {
  if (!validations())
    return false

  const words = [...document.querySelectorAll('input.word[type="text"]')]
  const beginning = Object.entries(states).filter(([, state]) => state.isInitial).map(([id]) => id)

  let belongs = false

  words.forEach(word => {
    const result = word.parentElement.querySelector('span.result')
    const letters = word.value.replace(' ', 'λ').split('')

    for (const initial of beginning) {
      belongs = undefinedFindWord(letters, [], [initial, 0])

      if (belongs)
        break
    }

    result.innerHTML = belongs
    belongs ? result.classList.remove('false') : result.classList.add('false')
  })
})