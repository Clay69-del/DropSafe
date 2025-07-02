import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';
import Home from './components/Home';
import Footer from './components/Footer';
import Upload from './components/Upload';
import YourFile from './components/YourFile';
import Blog from './components/Blog';
import About from './components/About';
import Contact from './components/Contact';
function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="container my-5 flex-grow-1">
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload/>}/>
            <Route path="/yourfile" element={<YourFile/>}/>
            <Route path="/blog" element={<Blog/>}/>
            <Route path="/about" element={<About/>}/>
            <Route path="/contact" element={<Contact/>}/>


        </Routes>
      </main>
        <Footer />
    </div>
  );
}

export default App;