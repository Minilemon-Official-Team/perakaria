PRAGMA foreign_keys = ON;

UPDATE content_entries
SET data_json='{"id":"client-1","name":"JTI","logoUrl":"/assets/clients/jti-reference.png","logoAlt":"JTI","websiteUrl":"","order":1,"isVisible":true,"isPlaceholder":false}',
    updated_by='76206d51-2b73-45b6-b66c-9169d46d4e9a', updated_at=CURRENT_TIMESTAMP
WHERE content_type='client' AND locale='id' AND slug='client-1' AND status='published';
UPDATE content_entries
SET data_json='{"id":"client-2","name":"Danone","logoUrl":"/assets/clients/danone-reference.png","logoAlt":"Danone","websiteUrl":"","order":2,"isVisible":true,"isPlaceholder":false}',
    updated_by='76206d51-2b73-45b6-b66c-9169d46d4e9a', updated_at=CURRENT_TIMESTAMP
WHERE content_type='client' AND locale='id' AND slug='client-2' AND status='published';
UPDATE content_entries
SET data_json='{"id":"client-3","name":"Koperasi Astra","logoUrl":"/assets/clients/koperasi-astra-reference.png","logoAlt":"Koperasi Astra","websiteUrl":"","order":3,"isVisible":true,"isPlaceholder":false}',
    updated_by='76206d51-2b73-45b6-b66c-9169d46d4e9a', updated_at=CURRENT_TIMESTAMP
WHERE content_type='client' AND locale='id' AND slug='client-3' AND status='published';

UPDATE content_entries
SET data_json='{"headline":"Alamat & Kontak","whatsappLabel":"WhatsApp","emailLabel":"Email","galleryImages":[{"imageUrl":"/assets/contact/grid-01.png","imageAlt":"Visual contact Perakaria 01","title":"Studio visual 01"},{"imageUrl":"/assets/contact/grid-02.png","imageAlt":"Visual contact Perakaria 02","title":"Studio visual 02"},{"imageUrl":"/assets/contact/grid-03.png","imageAlt":"Visual contact Perakaria 03","title":"Studio visual 03"},{"imageUrl":"/assets/contact/grid-04.png","imageAlt":"Visual contact Perakaria 04","title":"Studio visual 04"},{"imageUrl":"/assets/contact/grid-05.png","imageAlt":"Visual contact Perakaria 05","title":"Studio visual 05"},{"imageUrl":"/assets/contact/grid-06.png","imageAlt":"Visual contact Perakaria 06","title":"Studio visual 06"},{"imageUrl":"/assets/contact/grid-07.png","imageAlt":"Visual contact Perakaria 07","title":"Studio visual 07"},{"imageUrl":"/assets/contact/grid-08.png","imageAlt":"Visual contact Perakaria 08","title":"Studio visual 08"},{"imageUrl":"/assets/contact/grid-09.png","imageAlt":"Visual contact Perakaria 09","title":"Studio visual 09"}],"galleryDirection":"descending-right","galleryVerticalAlignment":"center","footerNote":"© 2026 Perakaria. Creative & Production House."}',
    updated_by='76206d51-2b73-45b6-b66c-9169d46d4e9a', updated_at=CURRENT_TIMESTAMP
WHERE content_type='contact' AND locale='id' AND slug='contact' AND status='published';