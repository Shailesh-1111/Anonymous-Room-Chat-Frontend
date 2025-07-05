import './App.css';
import { Route, Routes } from 'react-router-dom';
import ChatRoom from './pages/Room/Room';

function App() {
  return (
    <Routes>
      {/* <Route path='/' element={<Home/>} /> */}
      <Route path='/room/:roomId' element={<ChatRoom/>} />
    </Routes>
  );
}

export default App;
