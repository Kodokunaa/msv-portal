<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly string $status,
        public readonly string $reason,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $label = ucfirst($this->status);

        return (new MailMessage)
            ->subject('MSV account status: '.$label)
            ->greeting('Hello '.$notifiable->first_name.',')
            ->line('Your MSV member account is now '.$this->status.'.')
            ->line('Reason: '.$this->reason)
            ->line('Contact an MSV administrator if you have questions.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'account_status_changed',
            'status' => $this->status,
            'reason' => $this->reason,
            'message' => 'Your account is now '.$this->status.'.',
        ];
    }
}
