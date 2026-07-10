import React from 'react'
import Header from '../components/Header'
import LibraryHero from '../components/HeroSection/LibraryHero'
import NewRelease from '../components/marqueSlide/NewRelease'
import TrendingCard from '../components/card/TrendingCard'

const LibraryPage = () => {
  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-30">
        <Header/>
      </div>
      <LibraryHero className="" />
      <NewRelease />
      <TrendingCard/>
    </div>
  )
}

export default LibraryPage