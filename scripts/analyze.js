let thereIsNewState = false
let states = { }

/* Function to extract all transitions without repeat
 * from an automata */
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

/* Function to check if a word belogs to actal automata, first check if the
 * selected state has a transition with the selected letter, then if the
 * transition goes to several states and save all in the stack, the check if
 * its the last letter to analizy and if the state is a final, then if not
 * use the recursion with changed values */
const belongsToAutomata = (selected, letter, next, word, count, stack) => {
  let temp = {}
  if (states[selected].transitions[letter]) {
    if (states[selected].transitions[letter].size > 1 && !next)
      [...states[selected].transitions[letter]].filter((_e, i) => i > 0).forEach(transition => {
        stack.push({
          comes: selected,
          letter: letter,
          goal: transition,
          index: count
        })
      })
    
    selected = next ? next : [...states[selected].transitions[letter]][0]

    if (count === word.length - 1) {
      if (states[selected].isFinal)
        return true

      if (stack.length < 1)
        return false
        
      temp = stack.pop()
      return belongsToAutomata(temp.comes, temp.letter, temp.goal, word, temp.index, stack)
    }

    next = undefined
    letter = word[++count]

    return belongsToAutomata(selected, letter, next, word, count, stack)
  }

  if (stack.length < 1)
    return false
    
  temp = stack.pop()
  return belongsToAutomata(temp.comes, temp.letter, temp.goal, word, temp.index, stack)
}

/* Auxiliar function to fill and combine transitions
 * in the new states */
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

/* Auxiliar function to create new states, use the recursion
 * to created the states and follow the ways, also use
 * fillTransitions function */
const addStates = (new_states, id) => {
  new_states[id] = {
    isInitial: false,
    isFinal: false,
    label: '',
    transitions: fillTransitions(id)
  }

  Object.values(new_states[id].transitions).forEach(transition => {
    let new_id = [...transition][0]

    if (new_id.includes(',') && !thereIsNewState)
      thereIsNewState = true

    if (!new_states[new_id])
      addStates(new_states, new_id)
  })
}

/* Function to set new finals helping the second method
 * to find finals after rename the transformed automata */
const setFinals = (new_states, new_id) => {
  new_states[new_id].isFinal = true

  Object.values(new_states[new_id].transitions).forEach(transition => {
    if (!new_states[[...transition][0]].isFinal)
      setFinals(new_states, [...transition][0])
  })
}

/* Function to transform a undefined automata to defined, 
 * first identify the initial state and all finals, the do
 * a copy from actual automata and finally get the new
 * states with addStates function. After create the new automata
 * set the inital state, the final and rename the new automata's states */
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

  if (Object.keys(new_states).length < 1)
    Object.keys(aux_states).forEach(id => {
      if (!thereIsNewState)
        addStates(new_states, id)
    })
  
  // first way to get inital and final
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

  // alternative way to get inital and final
  if (!Object.values(new_states).find(state => state.isInitial))
    new_states[
      new_rename_table.find(([, equivalence]) =>
        equivalence === old_rename_table.find(([old_id,]) => old_id === initial[0])[1])[0]
    ].isInitial = true

  if (!Object.values(new_states).find(state => state.isFinal))
    finals.forEach(([final_id,]) => {
      let old_equivalence = old_rename_table.find(([old_id,]) => old_id === final_id)[1]
      let new_id = new_rename_table.find(([,equivalence]) => equivalence === old_equivalence)[0]

      if (!new_states[new_id].isFinal)
        setFinals(new_states, new_id)
    })
  
  // rename automata states
  let transform = {}

  Object.entries(new_states).forEach(([state_id, state]) => {
    const new_name = new_rename_table.find(ids => ids[0] === state_id)[1]
    transform[new_name] = JSON.parse(JSON.stringify(state))
    transform[new_name].label = state_id

    Object.entries(new_states[state_id].transitions).forEach(([transition_id, transition]) => {
      transform[new_name].transitions[transition_id] = new Set([new_rename_table.find(ids => ids[0] === [...transition][0])[1]])
    })
  })

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
}

/* Function to check if a word belongs to an automata
 * it search the start and the words, and use the
 * other functions to find the word it use the function
 * belongsToAutomata and print the all results */
const handleDataAnalyze = () => {
  if (!canAnalyze())
    return false

  const words = [...document.querySelectorAll('input.word[type="text"]')]
  const beginning = Object.entries(states).find(([, state]) => state.isInitial)[0]

  let belongs = false

  words.forEach(word => {
    const result = word.parentElement.querySelector('span.result')
    const letters = word.value.replaceAll(' ', 'λ').split('')

    belongs = belongsToAutomata(beginning, letters[0], undefined, letters, 0, [])
    
    result.innerHTML = belongs
    belongs ? result.classList.remove('false') : result.classList.add('false')
  })
}

/* Action buttons */
document.querySelector('button#clear').addEventListener('click', handleClear)
document.querySelector('button#afd').addEventListener('click', handleAFD)
document.querySelector('button#data_analyze').addEventListener('click', handleDataAnalyze)