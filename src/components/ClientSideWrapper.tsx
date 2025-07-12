import { useEffect } from 'react';
import { ClientWrapper } from './ClientComponents';

import ReactDOM from 'react-dom';

export default function ClientSideWrapper() {
  useEffect(() => {
    // Este código será executado apenas no lado do cliente
    const wrapperElement = document.createElement('div');
    wrapperElement.id = 'client-wrapper';
    document.body.appendChild(wrapperElement);

    // Renderizar o ClientWrapper no DOM
    ReactDOM.render(<ClientWrapper />, wrapperElement);

    // Limpar o DOM quando o componente for desmontado
    return () => {
      ReactDOM.unmountComponentAtNode(wrapperElement);
      wrapperElement.remove();
    };
  }, []);

  return null;
}