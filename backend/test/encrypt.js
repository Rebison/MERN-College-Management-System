import { randomBytes } from 'crypto';
import { hash as _hash } from 'bcrypt';

function generateRandomVariable(size) {
  return new Promise((resolve, reject) => {
    randomBytes(size, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf.toString('hex'));
      }
    });
  });
}

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    _hash(password, 10, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}

// generateRandomVariable(64)
//   .then(randomVariable => {
//     console.log('Random Variable:', randomVariable);
//   })
//   .catch(err => {
//     console.error('Error generating random variable:', err);
//   });

hashPassword('testpass')
  .then(hashedPassword => {
    console.log('Hashed Password for testpass:', hashedPassword);
  })
  .catch(err => {
    console.error('Error hashing password:', err);
  });