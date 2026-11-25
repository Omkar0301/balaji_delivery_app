package com.balaji.fresh

import android.app.Application
import android.content.Intent
import android.content.res.Configuration
import android.util.Log
import java.io.File

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ExpoReactHostFactory

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        }
    )
  }

  override fun onCreate() {
    super.onCreate()

    // Global Uncaught Exception Handler
    val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
    Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
      try {
        val stackTrace = Log.getStackTraceString(throwable)
        Log.e("BALAJI_CRASH", "Uncaught exception in thread ${thread.name}: $stackTrace")

        try {
          val internalFile = File(filesDir, "crash_log.txt")
          internalFile.writeText("Thread: ${thread.name}\nTime: ${System.currentTimeMillis()}\n\n$stackTrace")
        } catch (_: Throwable) {}

        try {
          getExternalFilesDir(null)?.let { extDir ->
            val extFile = File(extDir, "crash_log.txt")
            extFile.writeText("Thread: ${thread.name}\nTime: ${System.currentTimeMillis()}\n\n$stackTrace")
          }
        } catch (_: Throwable) {}

        val intent = Intent(applicationContext, CrashActivity::class.java).apply {
          putExtra("error_message", throwable.message ?: "Startup crash")
          putExtra("stack_trace", stackTrace)
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        }
        startActivity(intent)
        android.os.Process.killProcess(android.os.Process.myPid())
        System.exit(10)
      } catch (e: Throwable) {
        defaultHandler?.uncaughtException(thread, throwable)
      }
    }

    try {
      DefaultNewArchitectureEntryPoint.releaseLevel = ReleaseLevel.STABLE
      loadReactNative(this)
      ApplicationLifecycleDispatcher.onApplicationCreate(this)
    } catch (t: Throwable) {
      Log.e("BALAJI_CRASH", "Exception during MainApplication.onCreate", t)
      throw t
    }
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
