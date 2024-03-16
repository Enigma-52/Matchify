function toggleCardClick(button) {

    var card = button.closest('.pricing-card');

    card.classList.toggle('clicked');

    var features = card.querySelector('.features');
    features.classList.toggle('permanent');

    var featureItems = features.querySelectorAll('li');
    featureItems.forEach(function(item) {
        item.classList.toggle('permanent');
    });

    var paymentDetails = card.querySelector('.payment-details');
    paymentDetails.classList.toggle('permanent');

    button.style.display = 'none';
}