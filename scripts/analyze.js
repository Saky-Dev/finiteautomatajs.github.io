let wasConverted = false
let states = { }

const getAllTransitions = () =>
  new Set([].concat(...Object.values(states).map(state => Object.keys(state.transitions))))

const isDefined = () => {
  if (Object.values(states).filter(state => state.isInitial).length > 1)
    return false

  if (Object.values(states).filter(state => state.isFinal).length > 1)
    return false

  for (const state of Object.values(states)) {
    if (Object.values(state.transitions).findIndex(transition => transition.size > 1) > -1)
      return false
  }

  return true
}

const isAnAutomata = () => {
  const transitions = [].concat(...Object.values(states).map(state => Object.keys(state.transitions)))
  const hasInitial = Object.values(states).findIndex(state => state.isInitial) < 0 ? false : true
  const hasFinal = Object.values(states).findIndex(state => state.isFinal) < 0 ? false : true
  
  if (Object.keys(states).length < 2)
    return alert('Debes tener al menos 2 states en el area')

  if (transitions.length < 1)
    return alert('Debes de tener al menos una transición')

  if (!hasInitial || !hasFinal)
    return alert('Debes de definir un estado inicial y un final')

  return true
}
const canAnalyze = () => {
  if (!isAnAutomata)
    return false
    
  if (document.querySelector('div.input_data div.data').children.length < 1)
    return alert('Necesitas agregar minimo una palabra')
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

const transformAutomata = () => {
  const transitions = getAllTransitions()
  const initial = Object.entries(states).find(([,state]) => state.isInitial)
  const final = Object.entries(states).find(([,state]) => state.isFinal)
  let aux_states = {...states}
  let new_states = []

  Object.entries(aux_states).forEach(([state_id, state]) => {
    const hasEmpty = Object.keys(state.transitions).findIndex(transition => transition === 'λ')

    if (hasEmpty > -1)
      (new_states = [...new_states].concat(`${state_id},${[...state.transitions['λ']].join()}`),
      delete aux_states[state_id].transitions['λ'])
  })


  Object.values(aux_states).forEach(state => {
    new_states = [...new_states].concat(Object.values(state.transitions).map(transition => [...transition].join()))
  })

  new_states = [...new Set(new_states)]
  .sort((state_a, state_b) => state_a.split(',').length - state_b.split(',').length)
  .reverse()

  if (transitions.has('λ'))
    transitions.delete('λ')

  aux_states = {}

  new_states.forEach(state => {
    aux_states[state] = { 'transitions': {}, 'isInitial': false, 'isFinal': false }

    transitions.forEach(transition => {
      const old_result = states[state] ? states[state].transitions[transition] : false
      let new_result = ''

      if (state.split(',').length < 2 && !old_result)
        return false

      new_result = state.split(',').length < 2
      ? [...old_result].join()
      : `${state.split(',')
        .filter(old_state => states[old_state].transitions[transition])
        .map(old_state => [...states[old_state].transitions[transition]].join())}`

      if (new_result !== '')
        aux_states[state].transitions[transition] = new Set([new_result])
    })
  })

  aux_states[
    aux_states[initial[0]]
    ? initial[0]
    : Object.keys(aux_states).find(state => state.includes(initial[0]))
  ].isInitial = true

  aux_states[
    aux_states[final[0]]
    ? final[0]
    : Object.keys(aux_states).find(state => state.includes(final[0]))
  ].isFinal = true

  states = aux_states
}

document.querySelector('button#clear').addEventListener('click', () => {
  wasConverted = false

  states = {}

  ;[...document.querySelectorAll('button.state, svg.link, span.pointer')]
  .forEach(child => box_drag.removeChild(child))
})

document.querySelector('button#afd').addEventListener('click', () => {
  if (wasConverted)
    return alert('Se ha detectado una conversión previa, usa el boton de limpiar para reiniciar el conversor')

  let move = draggable.min_x + 100

  if (!isAnAutomata())
    return false
  
  if (isDefined())
    return alert('El automata ya es un finito definido')
  
  transformAutomata()

  ;[...document.querySelectorAll('button.state, svg.link, span.pointer')]
  .forEach(child => box_drag.removeChild(child))

  Object.keys(states).forEach((id, index) => {
    handleAdd({
      x: move,
      y: index % 2 === 0 ? draggable.max_y - 100 : draggable.min_y + 100
    }, id, true)
    move += index % 2 === 0 ? 200 : 0
  })


  document.querySelector(`button.state[key='${Object.entries(states).find(([,state]) => state.isInitial)[0]}']`)
  .classList.add('initial')

  document.querySelector(`button.state[key='${Object.entries(states).find(([,state]) => state.isFinal)[0]}']`)
  .classList.add('final')

  Object.entries(states).forEach(([state_id, state]) => {
    Object.values(state.transitions).forEach(transition =>  {
      link.starting = document.querySelector(`button.state[key='${state_id}']`)
      link.ending = document.querySelector(`button.state[key='${[...transition][0]}']`)

      stateTools.handleLink(link.ending, state_id, true)
    })
  })

  wasConverted = true
})

document.querySelector('button#data_analyze').addEventListener('click', () => {
  if (!canAnalyze())
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