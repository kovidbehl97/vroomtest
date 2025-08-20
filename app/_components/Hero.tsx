import React from 'react'



function Hero() {

	return (
		<div style={{
      background: `linear-gradient(to right, rgb(0 0 0 / 50%) 0%, rgba(0, 0, 0, 0) 100%), url(/hero.jpg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'top',
      backgroundRepeat: 'no-repeat'
    }} className="flex xl:flex-row flex-col gap-5 justify-center items-center h-[calc(100vh-200px)] w-screen overflow-hidden">
      <div className="flex flex-col justify-center items-start w-full pl-[100px]">
        <h1 className="text-7xl font-extrabold text-white">
          Find, book, rent a car quick and super easy!
        </h1>

        <p className="max-w-[470px] mt-5 font-light text-3xl text-white">
          Streamline your car rental experience with our effortless booking
          process.
        </p>

        
      </div>
      <div className="relative w-full h-full flex justify-center items-center overflow-hidden">	
        <div className="absolute -top-1/4 -right-1/4  bg-repeat-round w-full h-full"></div>
        <div className="relative left-0 top-0 w-[700px] h-[700px]">
          
        </div>
      </div>
    </div>
	)
}

export default Hero