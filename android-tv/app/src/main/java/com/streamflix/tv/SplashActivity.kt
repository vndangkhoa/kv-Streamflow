package com.streamflix.tv

import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.animation.OvershootInterpolator
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.FragmentActivity

/**
 * Splash screen with animated logo for StreamFlix TV
 */
class SplashActivity : FragmentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        val logo = findViewById<ImageView>(R.id.splash_logo)
        val title = findViewById<TextView>(R.id.splash_title)
        val tagline = findViewById<TextView>(R.id.splash_tagline)

        // Start with invisible elements
        logo.alpha = 0f
        logo.scaleX = 0.3f
        logo.scaleY = 0.3f
        title.alpha = 0f
        title.translationY = 50f
        tagline.alpha = 0f

        // Animate logo - scale up with bounce
        val logoScaleX = ObjectAnimator.ofFloat(logo, View.SCALE_X, 0.3f, 1f).apply {
            duration = 800
            interpolator = OvershootInterpolator(1.5f)
        }
        val logoScaleY = ObjectAnimator.ofFloat(logo, View.SCALE_Y, 0.3f, 1f).apply {
            duration = 800
            interpolator = OvershootInterpolator(1.5f)
        }
        val logoAlpha = ObjectAnimator.ofFloat(logo, View.ALPHA, 0f, 1f).apply {
            duration = 600
        }

        // Animate title - fade in and slide up
        val titleAlpha = ObjectAnimator.ofFloat(title, View.ALPHA, 0f, 1f).apply {
            duration = 500
            startDelay = 400
        }
        val titleTranslate = ObjectAnimator.ofFloat(title, View.TRANSLATION_Y, 50f, 0f).apply {
            duration = 500
            startDelay = 400
        }

        // Animate tagline - fade in
        val taglineAlpha = ObjectAnimator.ofFloat(tagline, View.ALPHA, 0f, 1f).apply {
            duration = 400
            startDelay = 700
        }

        // Play all animations
        AnimatorSet().apply {
            playTogether(logoScaleX, logoScaleY, logoAlpha, titleAlpha, titleTranslate, taglineAlpha)
            start()
        }

        // Navigate to main activity after delay
        Handler(Looper.getMainLooper()).postDelayed({
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        }, 1200)
    }
}
