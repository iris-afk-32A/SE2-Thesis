const winston = require('winston');

// !This code is also pretty much done so get yo hand off here lad (ง •̀_•́)ง

const logger = winston.createLogger({
  // *Basically, this is level 0 of logging aight? so we declare level 0 so that all activity 
  // *from that level to higher get captures. Ya getting me twin? (　`_ゝ´)
  level: 'info',

  // *We make the format for logs cause shit giving eye sore
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),

  // *So we declare where each type of log goes where here
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), 
    new winston.transports.File({ filename: 'logs/http.log', level: 'http'}),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// *This is more on production phase. We made a key that defines if we are on production or deployment
// *With this, ni coconsole log muna natin yung logs para mabilis makita in development phase. ໒( ⊡ _ ⊡ )७
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;