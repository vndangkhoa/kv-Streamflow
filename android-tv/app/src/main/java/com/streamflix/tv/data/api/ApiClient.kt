package com.streamflix.tv.data.api

import com.streamflix.tv.BuildConfig
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Singleton for API client creation
 */
object ApiClient {

    private const val CONNECT_TIMEOUT = 30L
    private const val READ_TIMEOUT = 30L
    private const val WRITE_TIMEOUT = 30L

    private val okHttpClient: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }

        OkHttpClient.Builder()
            .connectTimeout(CONNECT_TIMEOUT, TimeUnit.SECONDS)
            .readTimeout(READ_TIMEOUT, TimeUnit.SECONDS)
            .writeTimeout(WRITE_TIMEOUT, TimeUnit.SECONDS)
            .addInterceptor(logging)
            .addInterceptor { chain ->
                val request = chain.request()
                val timestamp = (System.currentTimeMillis() / 1000).toString()
                
                // Construct the path for signing (must start with /api)
                val url = request.url
                var path = url.encodedPath
                if (!path.startsWith("/api")) {
                    path = "/api$path"
                }
                
                val signature = signRequest(timestamp, path, request.method)
                
                val newRequestBuilder = request.newBuilder()
                    .header("User-Agent", "StreamFlixTV/1.0 Android")
                    .header("Accept", "application/json")
                
                if (signature != null) {
                    newRequestBuilder.header("X-Signature", signature)
                    newRequestBuilder.header("X-Timestamp", timestamp)
                }
                
                chain.proceed(newRequestBuilder.build())
            }
            .build()
    }

    private fun signRequest(timestamp: String, path: String, method: String): String? {
        // This should match the key in backend/security.py and frontend/scripts/api.js
        val secretKey = "sf_tv_secure_9s8d7f6g5h4j3k2l1"
        val payload = "$timestamp$path${method.uppercase()}"
        
        return try {
            val mac = javax.crypto.Mac.getInstance("HmacSHA256")
            val secretKeySpec = javax.crypto.spec.SecretKeySpec(secretKey.toByteArray(), "HmacSHA256")
            mac.init(secretKeySpec)
            val hmacBytes = mac.doFinal(payload.toByteArray())
            hmacBytes.joinToString("") { byte -> "%02x".format(byte) }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL + "/") // Production URL
            // .baseUrl("http://10.0.2.2:8000/") // Local Emulator URL for testing
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val api: StreamflixApi by lazy {
        retrofit.create(StreamflixApi::class.java)
    }

    /**
     * Get full URL for video proxy
     */
    fun getProxyUrl(m3u8Url: String): String {
        val encodedUrl = java.net.URLEncoder.encode(m3u8Url, "UTF-8")
        return "${BuildConfig.API_BASE_URL}/proxy/video?url=$encodedUrl"
    }

    /**
     * Get full URL for image
     */
    fun getImageUrl(imageUrl: String?): String {
        if (imageUrl.isNullOrEmpty()) return ""
        return if (imageUrl.startsWith("http")) {
            imageUrl
        } else {
            "${BuildConfig.API_BASE_URL}$imageUrl"
        }
    }
}
