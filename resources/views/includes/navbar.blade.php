<section class="header">
    <div>
        <img
            id="logo"
            src="/assets/Logo/logo.svg"
            alt="logo" />
        <h1>A-Type</h1>
    </div>
    <div class="hsbtns">
        <button onclick="window.open('{{ route('leaderboard') }}', '_parent')">
            <div class="icon-container">
                <i class="fas fa-fw fa-crown fa-lg"></i>
            </div>
        </button>
        <button onclick="window.open('{{ route('info') }}', '_parent')">
            <div class="icon-container">
                <i class="fas fa-fw fa-info fa-lg"></i>
            </div>
        </button>
    </div>
    <div class="hebtns">
        <button id="theme-toggle">
            <div class="icon-container">
                <i class="fas fa-fw fa-moon fa-lg"></i>
            </div>
        </button>
        <button onclick="window.open('{{ auth()->check() ? route('profile.show') : route('login') }}', '_parent')">
            <div class="icon-container">
                @if (auth()->check())
                    <i class="fas fa-fw fa-user fa-lg"></i>
                @else
                    <i class="fa-regular fa-user"></i>
                @endif
            </div>
        </button>
    </div>
</section>
