import { mostraModal } from './ui.js';

export function mostraDonazione() {
  mostraModal('donazioneModal');

  setTimeout(() => {
    if (typeof PayPal !== 'undefined' && PayPal.Donation) {
      PayPal.Donation.Button({
        env: 'production',
        hosted_button_id: 'XQP3LQJEU3C8U',
        image: {
          src: 'https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif',
          alt: 'Donate with PayPal button',
          title: 'PayPal - The safer, easier way to pay online!',
        }
      }).render('#donate-button');
    }
  }, 300);
}
