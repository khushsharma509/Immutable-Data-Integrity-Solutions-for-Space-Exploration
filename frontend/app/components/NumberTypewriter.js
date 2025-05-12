// components/NumberTypewriter.js
import Typewriter from 'typewriter-effect';

export default function NumberTypewriter({ number, className }) {
  return (
    <Typewriter
      options={{
        strings: [number.toLocaleString()],
        autoStart: true,
        loop: false,
        delay: 80,
        cursor: '',
      }}
      onInit={typewriter => {
        typewriter.typeString(number.toLocaleString()).start();
      }}
      className={className}
    />
  );
}
