import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs-core';

import TelegramBot from 'node-telegram-bot-api'
const token = '' //пишем сюда токен от телеги

const bot = new TelegramBot(token, { polling: true })

const arrd = [
   ['анализы', 'где находится раздел анализов', 'как посмотреть анализы', 'посмотреть анализы', 'лабораторные исследования', 'ЛИ', 'результаты анализов', 'общий анализ крови', 'кровь', 'исследования'],
   ['ЭМК', 'список эмк', 'список электронных медицинских карт', 'как добавить карту', 'мед карта', 'родственники', 'дети'],
   ['самозапись', 'как сделать самозапись', 'как записаться', 'запись', 'направления'],
] 
// как это работает: у каждомго элемента массива есть первоначальный элемент - этот элемент является темой объединящей остальные элементы в конкретном массиве, например анализы общий тэг для набора синонимов 'анализы', 'где находится раздел анализов' и т.д.
// каждый элемент массива проверяется на степень совпадния векторов со введенным пользовтаелем словом.

const check = async (que) => {
    var mass=[]
    const arr = [];
    const model = await use.load();

   // const embs = await model.embed(themes);
    const defembs = await model.embed(que);
  
    const sentenceJJ = tf.slice(defembs, [0], [1]);
    
    for (let i = 0; i < arrd.length; i++) {

      for (let j = 0; j < arrd[i].length; j++) {
        
        const embs = await model.embed(arrd[i]);
        const sentenceII = tf.slice(embs, [j], [1]);
        const sentenceIITranspose = true;
        const sentenceJJTransepose = false;
        const score =
          tf.matMul(
            sentenceJJ, sentenceII, sentenceJJTransepose, sentenceIITranspose, )
            .dataSync();
          console.log( score[0])
          // если совпадение больше 95% то считается что совпадение есть
          if (score[0] >= 0.95) {
            
            mass[i]= arrd[i][0]
          }
      }
    }
  console.log(mass.filter(Boolean).toString())
  return mass.filter(Boolean).toString()
      
    }


bot.on ('message', async (msg) => {
    const chatId = msg.chat.id
    
   
   
   if ((msg.text) == ('/start')) {
    bot.sendMessage(chatId, 'Ask me')
    // bot.sendMessage(chatId, 'Задайте вопрос схожий с темами: ЭМК, самозапись, анализы')
    //  bot.sendMessage(chatId, 'Например: лабораторные исследования')
   } 
   else {
    bot.sendMessage(chatId, 'Thinking..') 
    //const response = await conversation.sendMessage('What is OpenAI?')

    //const answer = await example(msg.text)
 const answer = await check(msg.text)
 bot.sendMessage(chatId, answer.toString()) 
    
    console.log(answer)
    //console.log(msg.text + ' ' + check(msg.text).toString())

if (answer == '') {
      bot.sendMessage(chatId, 'Ничего не нашел, попробуйте другой вопрос') }
    //   } else bot.sendMessage(chatId, 'Возможно вам подойдут варианты: ' + answer) 
   }
 })

   
