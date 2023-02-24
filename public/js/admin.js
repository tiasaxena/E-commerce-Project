const deleteProduct = btn => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    
    const productElement = btn.closest('article');
 
    //* fetch() is used to FETCH as well as SEND data.
    //Here we ain't sending data , we don't have a POST form.
    fetch('/admin/product/' + prodId, {
        method: 'DELETE',
        headers: {
          'csrf-token': csrf
        }
      })
    .then(result => {
      return result.json();
    })
    .then(data => {
        console.log(data);
      productElement.parentNode.removeChild(productElement);
    })
    .catch(err => {
      console.log(err);
    });
}