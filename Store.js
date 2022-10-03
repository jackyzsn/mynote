import React, { createContext, useReducer } from 'react';

export const Store = createContext();

const initialState = {
  config: {
    notegroup: '',
    encryptionkey: '',
    hasPermission: false,
    favColor: '#6FCF97',
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'CHANGE_CONFIG':
      return { ...state, config: action.payload };
    default:
      return state;
  }
}

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };

  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
