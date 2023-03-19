let thereIsNewState = false
let wasConverted = false
let states = { }

/* Function to extract all transitions without repeat
 * from actual states */
const getAllTransitions = () =>
  new Set([].concat(...Object.values(states).map(state => Object.keys(state.transitions))))

/* Function to check if the sutomata is defined, so check if the
 * automata have only one start, one final and if the transitions
 * only have a result per transition */
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

/* Here heck if the estructure created is an automata or not
 * to defined this, is checked if there are two states, one
 * transition and that have an initial and a final */
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

/* This is a special function to know if the automata can be
 * analized and check if words are included in the estructure
 * it use the checking if is an automata and check that the user
 * has been added a word */
const canAnalyze = () => {
  if (!isAnAutomata())
    return false
    
  if (document.querySelector('div.input_data div.data').children.length < 1)
    return alert('Necesitas agregar minimo una palabra')

  return true
}

/* Function to check if a word is included into a automata undefined
 * and it use the recursion and an stack, to save the diferent ways,
 * firts the function checks if the next transition exist and if not
 * try other way or returns false, next check change the selected
 * state and if there are more than one way, if saved on the stack
 * finally if is the last state and it's not the final check if there
 * are saved ways or returns false */
const undefinedFindWord = (letters, stack, [selected, position]) => {
  let lettering = [...letters]

  lettering.splice(0, position)

  for (const [index, single] of lettering.entries()) {
    if (!states[selected].transitions[single])
      return stack.length > 0 ? undefinedFindWord(letters, stack, stack.pop()) : false

    let transitions = [...states[selected].transitions[single]]
    
    transitions.length > 1
    ? (selected = transitions.shift(), transitions.forEach(state => stack.push([state, index])))
    : selected = transitions[0]

    if(index === lettering.length - 1 && !states[selected].isFinal)
      return stack.length > 0 ? undefinedFindWord(letters, stack, stack.pop()) : false
  }

  return states[selected].isFinal
}

/* Function to check if word is included into defined automata
 * this only check if there is a selected state and this have
 * the next step of way, if not the function returns false */
const definedFindWord = (letters, initial) => {
  let selected = initial

  for (const letter of letters) {
    if (selected && states[selected].transitions[letter])
      selected = [...states[selected].transitions[letter]][0]
    else {
      selected = false
      break
    }
  }

  return selected ? states[selected].isFinal : false
}

/* Function to transform a undefined automata to defined, first get all
 * transitions, get the actual start and final and do a copy of actual
 * states, then we search all empty transitions and combine them
 * the next step is join all transitions that ends in two or more states
 * then sort all transitions, delete the empy transition of the transitions
 * object, initialize the aux_states, then with the new states and the
 * transitions translate the old states to the new states and assign the
 * respective transitions, finally assign the new start and final and
 * replace the old states to the new */
const transformAutomata = () => {
  DFA()
  return

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
const fillTransitions = id => {
  let transitions = {}

  id.split(',').forEach(state => {
    Object.entries({...states[state].transitions}).forEach(([transition_id, transition]) => {
      transitions[transition_id] = !transitions[transition_id]
      ? transition
      : new Set([...transitions[transition_id]].concat([...transition]))
    })
  })

  if (transitions['λ'])
    delete transitions['λ']

  Object.entries(transitions).forEach(([transition_id, transition]) => {
    if (transition.size > 1)
      transitions[transition_id] = new Set([[...transitions[transition_id]].join()])
  })
  
  return transitions
}
const addStates = (new_states, id) => {
  console.log(id)

  new_states[id] = {
    isInitial: false,
    isFinal: false,
    transitions: fillTransitions(id)
  }

  Object.values(new_states[id].transitions).forEach(transition => {
    let new_id = [...transition][0]
    
    console.log(new_id.includes(','))

    if (new_id.includes(','))
      thereIsNewState = true

    if (!new_states[new_id])
      addStates(new_states, new_id)
  })
}
const DFA = () => {
  const transitions = getAllTransitions()
  const initial = Object.entries(states).find(([,state]) => state.isInitial)
  const final = Object.entries(states).filter(([,state]) => state.isFinal)

  let aux_states = JSON.parse(JSON.stringify(states))
  let rename_table = []
  let new_states = {}

  Object.keys(aux_states).forEach(id => aux_states[id].transitions = {...states[id].transitions})

  thereIsNewState = false

  if ([...transitions].indexOf('λ') > -1)
    Object.entries(aux_states)
    .filter(([, state]) => state.transitions['λ'])
    .forEach(([state_id, state]) => {
      if (!thereIsNewState)
        addStates(new_states, `${[...new Set([state_id,...state.transitions['λ']])].join()}`)
    })

  console.log(Object.keys(new_states).length)

  if (Object.keys(new_states).length < 1)
    Object.keys(aux_states).forEach(id => {
      console.log(`has: ${thereIsNewState}`)

      if (!thereIsNewState)
        addStates(new_states, id)
    })

  new_states[
    new_states[initial[0]]
    ? initial[0]
    : Object.keys(new_states).find(state => state.includes(initial[0]))
  ].isInitial = true

  final.forEach(([final_id,]) => {
    Object.entries(new_states).filter(([state_id,]) => state_id.includes(final_id)).forEach(([, state]) => state.isFinal = true )
  })

  Object.keys(new_states).forEach((state, index) => {
    rename_table.push([state, `Q${index}`])
  })

  let transform = {}

  Object.entries(new_states).forEach(([state_id, state]) => {
    const new_name = rename_table.find(ids => ids[0] === state_id)[1]
    transform[new_name] = {...state}

    Object.entries(transform[new_name].transitions).forEach(([transition_id, transition]) => {
      transform[new_name].transitions[transition_id] = new Set([rename_table.find(ids => ids[0] === [...transition][0])[1]])
    })
  })

  console.log(new_states)
  console.log(transform)
  states = transform
}

/* Function to clear the drag area, remove the states
 * the links and the pointers and set the conversion as
 * false */
const handleClear = () => {
  wasConverted = false

  states = {}

  ;[...document.querySelectorAll('button.state, svg.link, span.pointer')]
  .forEach(child => box_drag.removeChild(child))
}

/* Function that change the AFND to AFD, first check that didn't have
 * a conversion before, then is is an automa or it's defined, then do
 * the internal conversion and finally draw the new automata */
const handleAFD = () => {
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

  Object.entries(states)
  .filter(([,state]) => state.isFinal)
  .forEach(([state_id,]) => document.querySelector(`button.state[key='${state_id}']`).classList.add('final'))

  Object.entries(states).forEach(([state_id, state]) => {
    Object.values(state.transitions).forEach(transition =>  {
      link.starting = document.querySelector(`button.state[key='${state_id}']`)
      link.ending = document.querySelector(`button.state[key='${[...transition][0]}']`)

      stateTools.handleLink(link.ending, state_id, true)
    })
  })

  wasConverted = true
}

/* Function to check if a word belongs to an automata
 * it search all starts and the words, and use the
 * other functions to find the word that depends if the
 * automata is defined or undefined and show the result */
const handleDataAnalyze = () => {
  if (!canAnalyze())
    return false

  const words = [...document.querySelectorAll('input.word[type="text"]')]
  const beginning = Object.entries(states).filter(([, state]) => state.isInitial).map(([id,]) => id)

  let belongs = false

  words.forEach(word => {
    const result = word.parentElement.querySelector('span.result')
    const letters = word.value.replace(' ', 'λ').split('')

    if (isDefined())
      belongs = definedFindWord(letters, beginning[0])
    else
      for (const initial of beginning) {
        belongs = undefinedFindWord(letters, [], [initial, 0])

        if (belongs)
          break
      }

    result.innerHTML = belongs
    belongs ? result.classList.remove('false') : result.classList.add('false')
  })
}

/* Action buttons */
document.querySelector('button#clear').addEventListener('click', handleClear)
document.querySelector('button#afd').addEventListener('click', handleAFD)
document.querySelector('button#data_analyze').addEventListener('click', handleDataAnalyze)