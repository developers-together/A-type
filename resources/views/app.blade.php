<!DOCTYPE html>
<html lang="en">
@include('includes.head')

<body>
  <div
    id="app-root"
    data-page="{{ $page }}"
    data-props='@json($props)'
    @if (!empty($pageTitle)) data-page-title="{{ $pageTitle }}" @endif
  ></div>
</body>

</html>
