const donenv = require('dotenv').config()
const CronJob = require('cron').CronJob
const SlackBot = require('slackbots')
const request = require('request')

const bot = new SlackBot({
    token: process.env.TOKEN, 
    name: 'Max ETH Watch'
});

bot.on('start', function() {
    new CronJob('00 00 09 * * 1-5', function() {
        const getEthData = () => {
            request("https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD", (error, response) => {
              if (error) {
                console.log("Error: ", error)
              } else {
                const payLoad = JSON.parse(response.body)
                const targetData = payLoad.DISPLAY.ETH.USD
                const price = targetData.PRICE.replace(' ', '')
                let pctChange = targetData.CHANGEPCT24HOUR
                let positiveChange, verb, msgGroup
                let preposition = 'to'
                let params = {slackbot: true}

                const downMsg = ['No point in getting out of bed today.', 'Why do we even bother?', 'Better get the ol\' resume ready...', `Let\'s cancel any meetings with ${process.env.BOSS}.`, 'HODL the door.', 'I guess it\'s time to buy more.', `Blame ${process.env.TEAM_MEMBER}.`]
                const upMsg = ['Hell yeah! We\'re rich!', 'Today is looking like a good day!', 'Let\'s buy a boat!', 'We\'re going streaking!!!', 'Max is in a good mood!', 'We are officially smarter than Warren Buffet!']
                const sameMsg = ['Time is a flat circle.', 'Well that was anti-climactic.', 'Like kissing your sister.']
                
                if (pctChange.includes("-")) {
                    positiveChange = false
                    verb = 'down'
                    pctChange = pctChange.substr(1)
                    msgGroup = downMsg
                    params.icon_emoji = ':chart_with_downwards_trend:'
                } else if (pctChange === '0' || pctChange === '0.0') {
                    positiveChange = true
                    verb = 'the same'
                    msgGroup = sameMsg
                    params.icon_emoji = ':zero:'
                    pctChange = ''
                    preposition = 'at'
                } else {
                    positiveChange = true
                    verb = 'up'
                    msgGroup = upMsg
                    params.icon_emoji = ':chart_with_upwards_trend:'
                }

                actionMsg = msgGroup[Math.floor(Math.random()*msgGroup.length)]
                
                const msg = `Good morning, ${process.env.TEAM}! *ETH is ${verb}* ${pctChange}% ${preposition} *${price}*. ${actionMsg}`

                bot.postMessage(process.env.CHAT, msg, params)
                }
            })
        }

        getEthData()


      }, null, true, process.env.TIMEZONE)
})