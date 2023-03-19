let thereIsNewState = false
let wasConverted = false
let states = { }

/* Function to extract all transitions without repeat
 * from actual states */
const getAllTransitions = automata_selected =>
  new Set([].concat(...Object.values(automata_selected).map(state => Object.keys(state.transitions))))

/* Function to check if the sutomata is defined, so check if
 * the transitions only have a result per transition */
const isDefined = () => {
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
    label: '',
    transitions: fillTransitions(id)
  }

  Object.values(new_states[id].transitions).forEach(transition => {
    let new_id = [...transition][0]
    
    console.log(new_id.includes(','))

    if (new_id.includes(',') && !thereIsNewState)
      thereIsNewState = true

    if (!new_states[new_id])
      addStates(new_states, new_id)
  })
}
const setFinals = (new_states, new_id) => {
  new_states[new_id].isFinal = true

  Object.values(new_states[new_id].transitions).forEach(transition => {
    if (!new_states[[...transition][0]].isFinal)
      setFinals(new_states, [...transition][0])
  })
}

/* Function to transform a undefined automata to defined */
const transformAutomata = () => {
  const transitions = getAllTransitions(states)
  const initial = Object.entries(states).find(([,state]) => state.isInitial)
  const finals = Object.entries(states).filter(([,state]) => state.isFinal)

  let aux_states = JSON.parse(JSON.stringify(states))
  let new_rename_table = []
  let old_rename_table = []
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

  finals.forEach(([final_id,]) => {
    Object.entries(new_states).filter(([state_id,]) => state_id.includes(final_id)).forEach(([, state]) => state.isFinal = true )
  })

  Object.keys(new_states).forEach((state, index) => new_rename_table.push([state, `Q${index}`]))
  Object.keys(states).forEach((state, index) => old_rename_table.push([state, `Q${index}`]))

  if (!Object.values(finals).find(state => state.isInitial))
    new_states[
      new_rename_table.find(([, equivalence]) =>
        equivalence === old_rename_table.find(([old_id,]) => old_id === initial[0])[1])[0]
    ].isInitial = true

  if (!Object.values(finals).find(state => state.isFinal))
    finals.forEach(([final_id,]) => {
      let old_equivalence = old_rename_table.find(([old_id,]) => old_id === final_id)[1]
      let new_id = new_rename_table.find(([,equivalence]) => equivalence === old_equivalence)[0]

      if (!new_states[new_id].isFinal)
        setFinals(new_states, new_id)
    })

  let transform = {}

  Object.entries(new_states).forEach(([state_id, state]) => {
    const new_name = new_rename_table.find(ids => ids[0] === state_id)[1]
    transform[new_name] = JSON.parse(JSON.stringify(state))
    transform[new_name].label = state_id

    Object.entries(new_states[state_id].transitions).forEach(([transition_id, transition]) => {
      transform[new_name].transitions[transition_id] = new Set([new_rename_table.find(ids => ids[0] === [...transition][0])[1]])
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

  state_num = 0

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

  Object.entries(states).forEach(([state_id, state], index) => {
    handleAdd({
      x: move,
      y: index % 2 === 0 ? draggable.max_y - 100 : draggable.min_y + 100
    }, state_id, state.label, true)
    move += index % 2 === 0 ? 200 : 0
  })

  document.querySelector(`button.state[key='${Object.entries(states).find(([,state]) => state.isInitial)[0]}']`)
  .classList.add('initial')

  Object.entries(states)
  .filter(([,state]) => state.isFinal)
  .forEach(([state_id,]) => document.querySelector(`button.state[key='${state_id}']`).classList.add('final'))

  Object.entries(states).forEach(([state_id, state]) => {
    Object.entries(state.transitions).forEach(([transition_id, transition]) =>  {
      link.starting = document.querySelector(`button.state[key='${state_id}']`)
      link.ending = document.querySelector(`button.state[key='${[...transition][0]}']`)

      stateTools.handleLink(link.ending, transition_id, true)
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