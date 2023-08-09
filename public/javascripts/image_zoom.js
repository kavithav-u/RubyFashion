$(document).ready(function() {
    <% for (let i = 0; i < product.itemImage.length; i++) { %>
    $('#zoom_<%= i %>').ezPlus({
      zoomType: 'lens',
      lensShape: 'round',
      lensSize: 200
    });
    <% } %>
  });
  