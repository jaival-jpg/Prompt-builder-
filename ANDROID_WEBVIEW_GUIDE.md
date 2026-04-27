# Android WebView + Unity Ads Integration

This guide contains the complete Native Android code you requested for integrating your React web app inside an Android WebView, along with Unity Rewarded Video Ads based on the GAME ID `6100485` and Placement ID `Rewarded_Android`.

## 1. Prerequisites and Setup (`build.gradle`)

In your app-level `build.gradle` (or `build.gradle.kts`), add the following dependencies:

```gradle
dependencies {
    // Other dependencies...
    
    // Unity Ads dependency
    implementation("com.unity3d.ads:unity-ads:4.12.3")
}
```

## 2. Permissions (`AndroidManifest.xml`)

Make sure your app has internet access. Add this constraint inside your `<manifest>` block:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

<application
    ...
    android:usesCleartextTraffic="true">
    ...
</application>
```

## 3. The `MainActivity.kt` File

This is the full implementation of your main activity. It correctly initializes Unity Ads, loads the WebView, provides the Javascript Interface (`window.Android.showRewardAd()`), and triggers the Javascript callback (`window.onAdRewarded()`) ONLY when the ad state is `COMPLETED`.

Create/Overwrite `MainActivity.kt` in your project with the following:

```kotlin
package com.your.packagename

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.unity3d.ads.IUnityAdsInitializationListener
import com.unity3d.ads.IUnityAdsLoadListener
import com.unity3d.ads.IUnityAdsShowListener
import com.unity3d.ads.UnityAds

class MainActivity : AppCompatActivity(), IUnityAdsInitializationListener {

    private lateinit var webView: WebView

    private val unityGameID = "6100485"
    private val adUnitId = "Rewarded_Android"
    private val testMode = true // Set to false when publishing to the Play Store

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Simple layout with a match-parent WebView
        webView = WebView(this)
        setContentView(webView)

        setupWebView()

        // Initialize Unity Ads
        UnityAds.initialize(applicationContext, unityGameID, testMode, this)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        
        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()

        // Bind the JavaScript interface. In React this translates to window.Android
        webView.addJavascriptInterface(WebAppInterface(), "Android")

        // Replace with your actual hosted React App URL
        webView.loadUrl("https://your-react-app-hosted-url.com")
    }

    // --- Unity Ads Initialization Listener ---

    override fun onInitializationComplete() {
        // Initialization successful, we should load an ad right away to prepare
        loadRewardedAd()
    }

    override fun onInitializationFailed(error: UnityAds.UnityAdsInitializationError?, message: String?) {
        Toast.makeText(this, "Ad Init Failed: $message", Toast.LENGTH_SHORT).show()
    }

    // --- Ad Loading and Showing Logic ---

    private fun loadRewardedAd() {
        UnityAds.load(adUnitId, object : IUnityAdsLoadListener {
            override fun onUnityAdsAdLoaded(placementId: String) {
                // Ad is ready to be shown
            }

            override fun onUnityAdsFailedToLoad(placementId: String, error: UnityAds.UnityAdsLoadError, message: String) {
                // Handle Ad Load Failure
            }
        })
    }

    private fun showRewardedAd() {
        if (UnityAds.isInitialized()) {
            UnityAds.show(this, adUnitId, object : IUnityAdsShowListener {
                override fun onUnityAdsShowClick(placementId: String) {}

                override fun onUnityAdsShowStart(placementId: String) {}

                override fun onUnityAdsShowComplete(placementId: String, state: UnityAds.UnityAdsShowCompletionState) {
                    when (state) {
                         // Only reward the user if the ad was completely watched
                        UnityAds.UnityAdsShowCompletionState.COMPLETED -> {
                            triggerReactRewardCallback()
                        }
                        UnityAds.UnityAdsShowCompletionState.SKIPPED -> {
                            Toast.makeText(this@MainActivity, "Ad skipped. No credit rewarded.", Toast.LENGTH_SHORT).show()
                        }
                        else -> {}
                    }
                    // Load the next ad seamlessly in the background
                    loadRewardedAd()
                }

                override fun onUnityAdsShowFailure(placementId: String, error: UnityAds.UnityAdsShowError, message: String) {
                    Toast.makeText(this@MainActivity, "Failed to show ad: $message", Toast.LENGTH_SHORT).show()
                    loadRewardedAd()
                }
            })
        } else {
            Toast.makeText(this, "Ad not ready yet. Try again later.", Toast.LENGTH_SHORT).show()
            UnityAds.initialize(applicationContext, unityGameID, testMode, this@MainActivity)
        }
    }

    // --- React <-> Android Trigger ---
    
    private fun triggerReactRewardCallback() {
        // Must be run on the main UI thread when manipulating WebView properties
        runOnUiThread {
            webView.evaluateJavascript("javascript:window.onAdRewarded();", null)
            Toast.makeText(this,"Credit Awarded!", Toast.LENGTH_SHORT).show()
        }
    }

    // --- Javascript Bridge Interface ---
    
    private inner class WebAppInterface {
        @JavascriptInterface
        fun showRewardAd() {
            // Because Javascript interface methods run on a background thread natively, 
            // we must use runOnUiThread to invoke UI interactions or UnityAds.show
            runOnUiThread {
                showRewardedAd()
            }
        }
    }

    // --- Prevent back button from closing app if WebView can go back ---
    
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
```

## How It Works

1. **The Bridge Setup**: `webView.addJavascriptInterface(WebAppInterface(), "Android")` ensures that anything inside `WebAppInterface` with `@JavascriptInterface` can be triggered from your React code as `window.Android.eventName()`.
2. **The Ad Experience**: When a user clicks "Watch Ad" in React, `window.Android.showRewardAd()` is called. 
3. **The Yield/Reward**: The Android snippet checks for `UnityAdsShowCompletionState.COMPLETED`. If they actually completely watched the ad, the Android app tells the WebView to run the `window.onAdRewarded()` JavaScript function.
4. **React updates independently**: React catches `onAdRewarded()` via the `useEffect` we configured in the web codebase, automatically updating the user limit of `credits`.
