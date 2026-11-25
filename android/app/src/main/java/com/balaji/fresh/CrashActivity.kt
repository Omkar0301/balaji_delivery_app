package com.balaji.fresh

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast

class CrashActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setTheme(android.R.style.Theme_DeviceDefault_Light_NoActionBar)

        val errorMessage = intent.getStringExtra("error_message") ?: "Unknown error"
        val stackTrace = intent.getStringExtra("stack_trace") ?: "No stack trace available"

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#F8FAF5"))
            setPadding(40, 60, 40, 40)
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        val title = TextView(this).apply {
            text = "Balaji Fresh - Startup Diagnostics"
            textSize = 20f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.parseColor("#BA1A1A"))
            setPadding(0, 0, 0, 16)
        }
        root.addView(title)

        val desc = TextView(this).apply {
            text = "An unexpected error occurred during application startup:\n$errorMessage"
            textSize = 14f
            setTextColor(Color.parseColor("#191C1A"))
            setPadding(0, 0, 0, 20)
        }
        root.addView(desc)

        val btnRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, 0, 0, 20)
        }

        val copyBtn = Button(this).apply {
            text = "Copy Log"
            setOnClickListener {
                val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                val clip = ClipData.newPlainText("Crash Log", stackTrace)
                clipboard.setPrimaryClip(clip)
                Toast.makeText(this@CrashActivity, "Copied to clipboard", Toast.LENGTH_SHORT).show()
            }
        }
        btnRow.addView(copyBtn)

        val restartBtn = Button(this).apply {
            text = "Restart App"
            setOnClickListener {
                val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                    startActivity(launchIntent)
                }
                finish()
            }
        }
        btnRow.addView(restartBtn)
        root.addView(btnRow)

        val scrollView = ScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1.0f
            )
            setBackgroundColor(Color.parseColor("#FFFFFF"))
            setPadding(20, 20, 20, 20)
        }

        val logView = TextView(this).apply {
            text = stackTrace
            textSize = 12f
            typeface = Typeface.MONOSPACE
            setTextColor(Color.parseColor("#333333"))
            setTextIsSelectable(true)
        }
        scrollView.addView(logView)
        root.addView(scrollView)

        setContentView(root)
    }
}
