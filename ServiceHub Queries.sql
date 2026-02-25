

select *from users;

select *from provider_profiles;

select *from reviews;

select *from services;

select *from bookings;

DELETE FROM users
WHERE name = 'Amit';

ALTER TABLE users DROP COLUMN contact_number;