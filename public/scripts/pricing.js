function toggleCardClick(button) {
    // Get the parent pricing card element
    var card = button.closest('.pricing-card');
    // Toggle the 'clicked' class on the pricing card
    card.classList.toggle('clicked');

    // Toggle the 'permanent' class on features and payment details
    var features = card.querySelector('.features');
    features.classList.toggle('permanent');

    // Access the list items within the features section
    var featureItems = features.querySelectorAll('li');
    featureItems.forEach(function(item) {
        item.classList.toggle('permanent');
    });

    var paymentDetails = card.querySelector('.payment-details');
    paymentDetails.classList.toggle('permanent');

    button.style.display = 'none';
}
