import React, { useContext, useEffect, useState } from 'react'
import styles from './Watchlist.module.css'
import { client } from '../../client'
import coingecko from '../../api/coingecko'
import { CryptoContext } from '../../context/cryptoContext'
import {AiOutlineLike} from 'react-icons/ai'

export function UserWatchlist({watchlist}) {

  const {currency, setIsLoading, getWatchlists, coinPerformance, user} = useContext(CryptoContext)

  const [select, setSelect] = useState(false)
  const [coins, setCoins] = useState([])
  const [coinPriceNow, setCoinPriceNow] = useState([])
  const [watchlistLikes, setWatchlistLikes] = useState()

  let coinCopy = coins

  const handleWatchlistSelect = async (e, watchlist_id) => {
    e.preventDefault()
    if(select) {
      setSelect(false)
    } else {
      const url = `/watchlist/${watchlist_id}`
      const config = {
      headers: {
        Authorization: localStorage.getItem('token'),
      }
    }
    const {data} = await client.get(url, config)

    setSelect(true)
    setCoins(data.coins)
    }
  }

  const fetchCoinPrices = async () => {
      setIsLoading(true)
      const newCoins = coins.map(async (coin) => {
        const {data} = await coingecko.get(`coins/markets/?vs_currency=${currency}&ids=${coin.name}`) /* for testing: &ids=bitcoin%2C%20ethereum */
        coin.current_price = data[0]
        return coin
      })
      await Promise.all(newCoins).then((result) => {setCoinPriceNow(result)
      })
      setIsLoading(false)
  }

  const getCoinCopy = () => {
  coinCopy = JSON.parse(JSON.stringify(coins))
    coinCopy.forEach((coin, index) => {
      coin.current_price = coinPriceNow[index].current_price.current_price
    })
  }

  useEffect(() => {fetchCoinPrices()}, [coins])
  useEffect(() => {getCoinCopy()}, [coinPriceNow])
  useEffect(()=> {await getWatchlists(), setWatchlistLikes(watchlist?.votes?.length)}, [handleLike])
  useEffect(()=> {getWatchlists()}, [])

  const handleLike = async (watchlist) => {
    const url = `/watchlist/${watchlist._id}`
    const config = {
      headers: {
        Authorization: localStorage.getItem('token'),
      }
    }
    await client.post(url, config)
    console.log(watchlist._id)
    window.location.reload(false)

  }

  return (
    <div className={styles.watchlist_item} onClick={(e) => handleWatchlistSelect(e, watchlist.id._id)}>
      {<div>
        {select ? (
        <div className={styles.watchlist_item_selected}>
          <div className={styles.watchlist_item_header}>
            {watchlist?.id?.firstName}'s Watchlist
            <div className={styles.likes_container}>{watchlistLikes} <AiOutlineLike/></div>  
          </div>

            {coinCopy.map(coin => {return (
              <div className={styles.watchlist_coins_container} key={coin._id} >
                <div style={{backgroundColor: 'rgba(59, 213, 253, 1)', color: 'rgba(5, 0, 30, 1)'}}>{coin.name}</div>
                
                <div>Added on:{new Date(coin.addedAt).toLocaleDateString()} @ {coin.priceWhenAdded} {currency}</div>
                <div>Price now: {coin.current_price?.current_price} {currency}</div>
                <div>Coin Performance:  {coinPerformance(coin.priceWhenAdded, coin.current_price?.current_price)} %</div>
              </div>
              )})}
        </div>) : (
        <div className={styles.watchlist_item_unselected}>
          {watchlist?.id?.firstName}'s Watchlist
          <button className={styles.likes_container} onClick={() => handleLike(watchlist)} >{watchlist?.votes?.length} <AiOutlineLike/></button>
        </div>
      )}
      </div>}
    </div>
   
  )
}